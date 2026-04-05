import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { UserFormComponent } from './user-form.component';
import { UserRepository } from '@user/domain/user.repository';
import { User, UserFormData } from '@user/domain/user.model';

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

const mockFormData: UserFormData = {
  username: 'jdoe',
  name: 'John',
  surnames: 'Doe',
  email: 'john.doe@example.com',
  age: 30,
  active: true,
};

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let router: jasmine.SpyObj<Router>;
  let userRepository: jasmine.SpyObj<UserRepository>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  function configureTestBed(id: string | null): void {
    TestBed.configureTestingModule({
      imports: [UserFormComponent],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => id } } },
        },
        { provide: UserRepository, useValue: userRepository },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    userRepository = jasmine.createSpyObj('UserRepository', ['getById', 'create', 'update']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    userRepository.getById.and.returnValue(of(mockUser));
  });

  // ─── Creation ────────────────────────────────────────────────────────────────

  it('should create', () => {
    configureTestBed(null);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ─── ngOnInit ────────────────────────────────────────────────────────────────

  describe('ngOnInit – create mode (no id)', () => {
    beforeEach(() => {
      configureTestBed(null);
      fixture.detectChanges();
    });

    it('should stay in create mode', () => {
      expect(component.isEditMode()).toBeFalse();
    });

    it('should not call getById', () => {
      expect(userRepository.getById).not.toHaveBeenCalled();
    });

    it('should leave userId as null', () => {
      expect(component.userId()).toBeNull();
    });
  });

  describe('ngOnInit – edit mode (with id)', () => {
    beforeEach(() => {
      configureTestBed('1');
      fixture.detectChanges();
    });

    it('should set isEditMode to true', () => {
      expect(component.isEditMode()).toBeTrue();
    });

    it('should set userId', () => {
      expect(component.userId()).toBe('1');
    });

    it('should call getById with the route id', () => {
      expect(userRepository.getById).toHaveBeenCalledWith('1');
    });
  });

  // ─── loadUser ────────────────────────────────────────────────────────────────

  describe('loadUser', () => {
    beforeEach(() => configureTestBed(null));

    it('should populate userData and set loading=false on success', () => {
      fixture.detectChanges();
      component.loadUser('1');

      expect(component.userData()).toEqual(mockFormData);
      expect(component.loading()).toBeFalse();
    });

    it('should show snackBar and navigate to /users on error', () => {
      spyOn(console, 'error');
      userRepository.getById.and.returnValue(throwError(() => new Error('Not found')));
      fixture.detectChanges();

      component.loadUser('99');

      expect(snackBar.open).toHaveBeenCalledWith('User not found', 'Close', { duration: 4000 });
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
    });
  });

  // ─── onSubmit ────────────────────────────────────────────────────────────────

  describe('onSubmit', () => {
    it('should call createUser when NOT in edit mode', () => {
      configureTestBed(null);
      fixture.detectChanges();
      userRepository.create.and.returnValue(of(mockUser));

      spyOn(component, 'createUser');
      component.onSubmit(mockFormData);

      expect(component.createUser).toHaveBeenCalledWith(mockFormData);
    });

    it('should call updateUser when in edit mode with userId', () => {
      configureTestBed('1');
      fixture.detectChanges();

      spyOn(component, 'updateUser');
      component.onSubmit(mockFormData);

      expect(component.updateUser).toHaveBeenCalledWith('1', mockFormData);
    });

    it('should set loading=true before delegating', () => {
      configureTestBed(null);
      fixture.detectChanges();
      userRepository.create.and.returnValue(of(mockUser));

      spyOn(component, 'createUser');
      component.onSubmit(mockFormData);

      expect(component.loading()).toBeTrue();
    });
  });

  // ─── createUser ──────────────────────────────────────────────────────────────

  describe('createUser', () => {
    beforeEach(() => {
      configureTestBed(null);
      fixture.detectChanges();
    });

    it('should show snackBar and navigate to /users on success', () => {
      userRepository.create.and.returnValue(of(mockUser));

      component.createUser(mockFormData);

      expect(snackBar.open).toHaveBeenCalledWith('User created', 'Close', { duration: 3000 });
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
    });

    it('should show error snackBar and set loading=false on error', () => {
      spyOn(console, 'error');
      userRepository.create.and.returnValue(throwError(() => new Error('Create failed')));

      component.loading.set(true);
      component.createUser(mockFormData);

      expect(snackBar.open).toHaveBeenCalledWith('Error creating user', 'Close', {
        duration: 4000,
      });
      expect(component.loading()).toBeFalse();
    });
  });

  // ─── updateUser ──────────────────────────────────────────────────────────────

  describe('updateUser', () => {
    beforeEach(() => {
      configureTestBed('1');
      fixture.detectChanges();
    });

    it('should show snackBar and navigate to /users on success', () => {
      userRepository.update.and.returnValue(of(mockUser));

      component.updateUser('1', mockFormData);

      expect(snackBar.open).toHaveBeenCalledWith('User updated', 'Close', { duration: 3000 });
      expect(router.navigate).toHaveBeenCalledWith(['/users']);
    });

    it('should show error snackBar and set loading=false on error', () => {
      spyOn(console, 'error');
      userRepository.update.and.returnValue(throwError(() => new Error('Update failed')));

      component.loading.set(true);
      component.updateUser('1', mockFormData);

      expect(snackBar.open).toHaveBeenCalledWith('Error updating user', 'Close', {
        duration: 4000,
      });
      expect(component.loading()).toBeFalse();
    });
  });

  // ─── onCancel ────────────────────────────────────────────────────────────────

  describe('onCancel', () => {
    it('should navigate to /users', () => {
      configureTestBed(null);
      fixture.detectChanges();

      component.onCancel();

      expect(router.navigate).toHaveBeenCalledWith(['/users']);
    });
  });

  // ─── isDirty ─────────────────────────────────────────────────────────────────

  describe('isDirty – before view initialization', () => {
    it('should return false when the view is not yet initialized', () => {
      configureTestBed(null);
      // detectChanges not called — viewChild signal has no value yet
      expect(component.isDirty()).toBeFalse();
    });
  });

  describe('isDirty', () => {
    beforeEach(() => {
      configureTestBed(null);
      fixture.detectChanges();
    });

    it('should return false when the form has not been modified', () => {
      expect(component.isDirty()).toBeFalse();
    });

    it('should return true when the form has been modified', () => {
      component.dynamicForm()!.formGroup.markAsDirty();

      expect(component.isDirty()).toBeTrue();
    });

    it('should return false after a successful create even if the form is dirty', () => {
      userRepository.create.and.returnValue(of(mockUser));
      component.dynamicForm()!.formGroup.markAsDirty();

      component.createUser(mockFormData);

      expect(component.isDirty()).toBeFalse();
    });

    it('should return false after a successful update even if the form is dirty', () => {
      userRepository.update.and.returnValue(of(mockUser));
      component.dynamicForm()!.formGroup.markAsDirty();

      component.updateUser('1', mockFormData);

      expect(component.isDirty()).toBeFalse();
    });
  });

  // ─── mapUserToFormData ───────────────────────────────────────────────────────

  describe('mapUserToFormData (via loadUser)', () => {
    beforeEach(() => {
      configureTestBed(null);
      fixture.detectChanges();
    });

    it('should map only the editable user fields to form data', () => {
      component.loadUser('1');

      const formData = component.userData();
      expect(formData.username).toBe('jdoe');
      expect(formData.name).toBe('John');
      expect(formData.surnames).toBe('Doe');
      expect(formData.email).toBe('john.doe@example.com');
      expect(formData.age).toBe(30);
      expect(formData.active).toBeTrue();
    });

    it('should not include id, password, createdAt or lastLogin', () => {
      component.loadUser('1');

      const formData = component.userData() as Record<string, unknown>;
      expect(formData['id']).toBeUndefined();
      expect(formData['password']).toBeUndefined();
      expect(formData['createdAt']).toBeUndefined();
      expect(formData['lastLogin']).toBeUndefined();
    });
  });
});
