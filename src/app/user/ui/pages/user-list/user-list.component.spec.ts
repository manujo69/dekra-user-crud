import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { of, throwError, Subject } from 'rxjs';

import { UserListComponent } from './user-list.component';
import { UserRepository } from '@user/domain/user.repository';
import { User } from '@user/domain/user.model';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

const mockUsers: User[] = [
  {
    id: '1',
    username: 'jdoe',
    name: 'John',
    surnames: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashed1',
    birthDate: '1993-05-15',
    active: true,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '2',
    username: 'asmith',
    name: 'Alice',
    surnames: 'Smith',
    email: 'alice.smith@example.com',
    password: 'hashed2',
    birthDate: '1998-08-20',
    active: false,
    createdAt: new Date('2025-02-20'),
  },
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
        { provide: MatDialog, useValue: dialog },
      ],
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
    expect(component.displayedColumns).toEqual([
      'username',
      'name',
      'email',
      'birthDate',
      'active',
      'actions',
    ]);
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
      spyOn(console, 'error');
      userRepository.getAll.and.returnValue(throwError(() => new Error('Network error')));
      fixture.detectChanges();

      expect(component.loading()).toBeFalse();
      expect(snackBar.open).toHaveBeenCalledWith('Error loading users', 'Close', {
        duration: 4000,
      });
    });

    it('should reset loading=true and call getAll again when called directly', () => {
      fixture.detectChanges();
      userRepository.getAll.calls.reset();

      component.loadUsers();

      expect(component.loading()).toBeFalse(); // resolved synchronously via of()
      expect(userRepository.getAll).toHaveBeenCalledTimes(1);
    });
  });

  // ─── displayedUsers – filtering ──────────────────────────────────────────────

  describe('displayedUsers – filtering', () => {
    beforeEach(() => fixture.detectChanges());

    it('should return all users when the filter is empty', () => {
      expect(component.displayedUsers()).toEqual(mockUsers);
    });

    it('should filter by username (case-insensitive)', () => {
      component.onFilter('JDOE');
      expect(component.displayedUsers()).toEqual([mockUsers[0]]);
    });

    it('should filter by name', () => {
      component.onFilter('alice');
      expect(component.displayedUsers()).toEqual([mockUsers[1]]);
    });

    it('should filter by surnames', () => {
      component.onFilter('smith');
      expect(component.displayedUsers()).toEqual([mockUsers[1]]);
    });

    it('should filter by email', () => {
      component.onFilter('john.doe');
      expect(component.displayedUsers()).toEqual([mockUsers[0]]);
    });

    it('should return empty array when no user matches', () => {
      component.onFilter('zzz_no_match');
      expect(component.displayedUsers()).toEqual([]);
    });

    it('should restore all users when filter is cleared', () => {
      component.onFilter('jdoe');
      component.onFilter('');
      expect(component.displayedUsers()).toEqual(mockUsers);
    });
  });

  // ─── displayedUsers – sorting ─────────────────────────────────────────────────

  describe('displayedUsers – sorting', () => {
    beforeEach(() => fixture.detectChanges());

    it('should preserve original order when no sort is applied', () => {
      expect(component.displayedUsers()).toEqual(mockUsers);
    });

    it('should sort by username ascending', () => {
      // Users reversed so V8 comparator is called with (jdoe, asmith) → valA > valB branch
      component.users.set([mockUsers[1], mockUsers[0]]);
      component.onSortChange({ active: 'username', direction: 'asc' } as Sort);
      expect(component.displayedUsers().map(u => u.username)).toEqual(['asmith', 'jdoe']);
    });

    it('should sort by username descending', () => {
      component.onSortChange({ active: 'username', direction: 'desc' } as Sort);
      expect(component.displayedUsers().map(u => u.username)).toEqual(['jdoe', 'asmith']);
    });

    it('should sort by birthDate ascending', () => {
      component.onSortChange({ active: 'birthDate', direction: 'asc' } as Sort);
      expect(component.displayedUsers().map(u => u.birthDate)).toEqual(['1993-05-15', '1998-08-20']);
    });

    it('should sort by birthDate descending', () => {
      component.onSortChange({ active: 'birthDate', direction: 'desc' } as Sort);
      expect(component.displayedUsers().map(u => u.birthDate)).toEqual(['1998-08-20', '1993-05-15']);
    });

    it('should restore original order when sort is cleared', () => {
      component.onSortChange({ active: 'username', direction: 'asc' } as Sort);
      component.onSortChange({ active: '', direction: '' } as Sort);
      expect(component.displayedUsers()).toEqual(mockUsers);
    });

    it('should handle undefined field values by falling back to empty string', () => {
      // lastLogin is optional (undefined for both mock users) → ?? '' branch
      component.onSortChange({ active: 'lastLogin', direction: 'asc' } as Sort);
      expect(component.displayedUsers()).toEqual(mockUsers);
    });

    it('should preserve relative order when two users have equal values (asc)', () => {
      component.users.set([
        { ...mockUsers[0], birthDate: '1990-01-01' },
        { ...mockUsers[1], birthDate: '1990-01-01' },
      ]);
      component.onSortChange({ active: 'birthDate', direction: 'asc' } as Sort);
      expect(component.displayedUsers().map(u => u.birthDate)).toEqual(['1990-01-01', '1990-01-01']);
    });

    it('should preserve relative order when two users have equal values (desc)', () => {
      component.users.set([
        { ...mockUsers[0], birthDate: '1990-01-01' },
        { ...mockUsers[1], birthDate: '1990-01-01' },
      ]);
      component.onSortChange({ active: 'birthDate', direction: 'desc' } as Sort);
      expect(component.displayedUsers().map(u => u.birthDate)).toEqual(['1990-01-01', '1990-01-01']);
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
      dialog.open.and.returnValue({
        afterClosed: () => afterClosed$,
      } as unknown as MatDialogRef<ConfirmDialogComponent>);
      fixture.detectChanges();
    });

    it('should open ConfirmDialogComponent with correct data', () => {
      component.onDeleteUser(mockUsers[0]);

      expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
        data: {
          title: 'Delete user',
          message: `Are you sure you want to delete "jdoe"?`,
          confirmLabel: 'Delete',
        },
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
      spyOn(console, 'error');
      userRepository.delete.and.returnValue(throwError(() => new Error('Delete failed')));

      component.onDeleteUser(mockUsers[0]);
      afterClosed$.next(true);

      expect(snackBar.open).toHaveBeenCalledWith('Error deleting user', 'Close', {
        duration: 4000,
      });
    });

    it('should use the correct username in dialog message for any user', () => {
      component.onDeleteUser(mockUsers[1]);

      expect(dialog.open).toHaveBeenCalledWith(
        ConfirmDialogComponent,
        jasmine.objectContaining({
          data: jasmine.objectContaining({
            message: `Are you sure you want to delete "asmith"?`,
          }),
        }),
      );
    });
  });
});
