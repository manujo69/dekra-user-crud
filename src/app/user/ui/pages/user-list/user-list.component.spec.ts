import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError, Subject } from 'rxjs';

import { UserListComponent } from './user-list.component';
import { UserRepository } from '../../../domain/ports/user.repository';
import { User } from '../../../domain/models/user.model';
import { ConfirmDialogComponent } from '../../../../shared/ui/components/confirm-dialog/confirm-dialog.component';

const mockUsers: User[] = [
  {
    id: '1',
    username: 'jdoe',
    name: 'John',
    surnames: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashed1',
    age: 30,
    active: true,
    createdAt: new Date('2025-01-15')
  },
  {
    id: '2',
    username: 'asmith',
    name: 'Alice',
    surnames: 'Smith',
    email: 'alice.smith@example.com',
    password: 'hashed2',
    age: 25,
    active: false,
    createdAt: new Date('2025-02-20')
  }
];

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let router: jasmine.SpyObj<Router>;
  let userRepository: jasmine.SpyObj<UserRepository>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    userRepository = jasmine.createSpyObj('UserRepository', ['getAll', 'delete']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    userRepository.getAll.and.returnValue(of(mockUsers));

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: UserRepository, useValue: userRepository },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: MatDialog, useValue: dialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
  });

  // ─── Creation ────────────────────────────────────────────────────────────────

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should expose the expected displayedColumns', () => {
    expect(component.displayedColumns).toEqual(['username', 'name', 'email', 'age', 'active', 'actions']);
  });

  // ─── ngOnInit / loadUsers ─────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call loadUsers on init', () => {
      spyOn(component, 'loadUsers');
      fixture.detectChanges();
      expect(component.loadUsers).toHaveBeenCalled();
    });

    it('should start with loading=true before data arrives', () => {
      expect(component.loading()).toBeTrue();
    });
  });

  describe('loadUsers', () => {
    it('should populate users signal and set loading=false on success', () => {
      fixture.detectChanges();
      expect(component.users()).toEqual(mockUsers);
      expect(component.loading()).toBeFalse();
    });

    it('should show snackBar and set loading=false on error', () => {
      userRepository.getAll.and.returnValue(throwError(() => new Error('Network error')));
      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
      expect(snackBar.open).toHaveBeenCalledWith('Error loading users', 'Close', { duration: 4000 });
    });

    it('should reset loading=true and call getAll again when called directly', () => {
      fixture.detectChanges();
      userRepository.getAll.calls.reset();

      component.loadUsers();

      expect(component.loading()).toBeFalse(); // resolved synchronously via of()
      expect(userRepository.getAll).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Navigation actions ───────────────────────────────────────────────────────

  describe('onCreateUser', () => {
    it('should navigate to /users/new', () => {
      fixture.detectChanges();
      component.onCreateUser();
      expect(router.navigate).toHaveBeenCalledWith(['/users/new']);
    });
  });

  describe('onViewUser', () => {
    it('should navigate to /users/:id', () => {
      fixture.detectChanges();
      component.onViewUser(mockUsers[0]);
      expect(router.navigate).toHaveBeenCalledWith(['/users', '1']);
    });
  });

  describe('onEditUser', () => {
    it('should navigate to /users/:id/edit', () => {
      fixture.detectChanges();
      component.onEditUser(mockUsers[0]);
      expect(router.navigate).toHaveBeenCalledWith(['/users', '1', 'edit']);
    });
  });

  // ─── onDeleteUser ─────────────────────────────────────────────────────────────

  describe('onDeleteUser', () => {
    let afterClosed$: Subject<boolean | undefined>;

    beforeEach(() => {
      afterClosed$ = new Subject<boolean | undefined>();
      dialog.open.and.returnValue(
        { afterClosed: () => afterClosed$ } as unknown as MatDialogRef<ConfirmDialogComponent>
      );
      fixture.detectChanges();
    });

    it('should open ConfirmDialogComponent with correct data', () => {
      component.onDeleteUser(mockUsers[0]);

      expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
        data: {
          title: 'Delete user',
          message: `Are you sure you want to delete "jdoe"?`,
          confirmLabel: 'Delete'
        }
      });
    });

    it('should delete user, show snackBar and reload list when confirmed', () => {
      userRepository.delete.and.returnValue(of(true));
      userRepository.getAll.calls.reset();

      component.onDeleteUser(mockUsers[0]);
      afterClosed$.next(true);

      expect(userRepository.delete).toHaveBeenCalledWith('1');
      expect(snackBar.open).toHaveBeenCalledWith('User deleted', 'Close', { duration: 3000 });
      expect(userRepository.getAll).toHaveBeenCalled(); // loadUsers called again
    });

    it('should not call delete when dialog is cancelled', () => {
      component.onDeleteUser(mockUsers[0]);
      afterClosed$.next(false);

      expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it('should not call delete when dialog is dismissed (undefined)', () => {
      component.onDeleteUser(mockUsers[0]);
      afterClosed$.next(undefined);

      expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it('should show error snackBar when delete fails', () => {
      userRepository.delete.and.returnValue(throwError(() => new Error('Delete failed')));

      component.onDeleteUser(mockUsers[0]);
      afterClosed$.next(true);

      expect(snackBar.open).toHaveBeenCalledWith('Error deleting user', 'Close', { duration: 4000 });
    });

    it('should use the correct username in dialog message for any user', () => {
      component.onDeleteUser(mockUsers[1]);

      expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, jasmine.objectContaining({
        data: jasmine.objectContaining({
          message: `Are you sure you want to delete "asmith"?`
        })
      }));
    });
  });
});
