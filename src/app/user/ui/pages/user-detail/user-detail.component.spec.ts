import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError, Subject } from 'rxjs';

import { UserDetailComponent } from './user-detail.component';
import { UserRepository } from '@user/domain/user.repository';
import { User } from '@user/domain/user.model';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

const mockUser: User = {
  id: '1',
  username: 'jdoe',
  name: 'John',
  surnames: 'Doe',
  email: 'john.doe@example.com',
  password: 'hashed',
  age: 30,
  active: true,
  createdAt: new Date('2025-01-15'),
};

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let router: jasmine.SpyObj<Router>;
  let userRepository: jasmine.SpyObj<UserRepository>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialog: jasmine.SpyObj<MatDialog>;

  function configureTestBed(id: string | null): void {
    TestBed.configureTestingModule({
      imports: [UserDetailComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => id } } },
        },
        { provide: UserRepository, useValue: userRepository },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MatDialog, useValue: dialog },
      ],
    });
    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    userRepository = jasmine.createSpyObj('UserRepository', ['getById', 'delete']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    userRepository.getById.and.returnValue(of(mockUser));
  });

  // ─── ngOnInit ────────────────────────────────────────────────────────────────

  describe('ngOnInit with id in route', () => {
    beforeEach(() => configureTestBed('1'));

    it('should create the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should call getById with the route id', () => {
      fixture.detectChanges();
      expect(userRepository.getById).toHaveBeenCalledWith('1');
    });

    it('should set user signal and loading=false on success', () => {
      fixture.detectChanges();
      expect(component.user()).toEqual(mockUser);
      expect(component.loading()).toBeFalse();
    });

    it('should show snackBar and navigate to /users on load error', () => {
      spyOn(console, 'error');
      userRepository.getById.and.returnValue(throwError(() => new Error('Not found')));
      fixture.detectChanges();

      expect(snackBar.open).toHaveBeenCalledWith('User not found', 'Close', { duration: 4000 });
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
    });
  });

  describe('ngOnInit without id in route', () => {
    beforeEach(() => configureTestBed(null));

    it('should navigate to /users immediately', () => {
      fixture.detectChanges();
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
    });

    it('should not call getById', () => {
      fixture.detectChanges();
      expect(userRepository.getById).not.toHaveBeenCalled();
    });
  });

  // ─── onBack ──────────────────────────────────────────────────────────────────

  describe('onBack', () => {
    beforeEach(() => {
      configureTestBed('1');
      fixture.detectChanges();
    });

    it('should navigate to /users', () => {
      component.onBack();
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
    });
  });

  // ─── onEdit ──────────────────────────────────────────────────────────────────

  describe('onEdit', () => {
    it('should navigate to /users/:id/edit when user is loaded', () => {
      configureTestBed('1');
      fixture.detectChanges();

      component.onEdit();

      expect(router.navigate).toHaveBeenCalledWith(['/users', '1', 'edit']);
    });

    it('should not navigate when user signal is null', () => {
      configureTestBed(null);
      fixture.detectChanges();

      component.onEdit();

      expect(router.navigate).not.toHaveBeenCalledWith(jasmine.arrayContaining(['edit']));
    });
  });

  // ─── onDelete ────────────────────────────────────────────────────────────────

  describe('onDelete', () => {
    let afterClosed$: Subject<boolean | undefined>;

    beforeEach(() => {
      afterClosed$ = new Subject<boolean | undefined>();
      dialog.open.and.returnValue({
        afterClosed: () => afterClosed$,
      } as unknown as MatDialogRef<ConfirmDialogComponent>);
    });

    it('should do nothing when user signal is null', () => {
      configureTestBed(null);
      fixture.detectChanges();

      component.onDelete();

      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('should open ConfirmDialogComponent with correct data', () => {
      configureTestBed('1');
      fixture.detectChanges();

      component.onDelete();

      expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
        data: {
          title: 'Delete user',
          message: `Are you sure you want to delete "jdoe"?`,
          confirmLabel: 'Delete',
        },
      });
    });

    it('should delete user, show snackBar and navigate when confirmed', fakeAsync(() => {
      userRepository.delete.and.returnValue(of(true));
      configureTestBed('1');
      fixture.detectChanges();

      component.onDelete();
      afterClosed$.next(true);
      flush();

      expect(userRepository.delete).toHaveBeenCalledWith('1');
      expect(snackBar.open).toHaveBeenCalledWith('User deleted', 'Close', { duration: 3000 });
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
    }));

    it('should not call delete when dialog is cancelled', () => {
      configureTestBed('1');
      fixture.detectChanges();

      component.onDelete();
      afterClosed$.next(false);

      expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it('should not call delete when dialog is dismissed (undefined)', () => {
      configureTestBed('1');
      fixture.detectChanges();

      component.onDelete();
      afterClosed$.next(undefined);

      expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it('should show error snackBar when delete fails', () => {
      spyOn(console, 'error');
      userRepository.delete.and.returnValue(throwError(() => new Error('Delete failed')));
      configureTestBed('1');
      fixture.detectChanges();

      component.onDelete();
      afterClosed$.next(true);

      expect(snackBar.open).toHaveBeenCalledWith('Error deleting user', 'Close', {
        duration: 4000,
      });
    });
  });
});
