import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserMockRepository, MOCK_DELAY_MS } from './user-mock.repository';
import { User, UserFormData } from '@user/domain/user.model';

describe('UserMockRepository', () => {
  let repository: UserMockRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserMockRepository],
    });
    repository = TestBed.inject(UserMockRepository);
  });

  describe('getById', () => {
    it('should return the user with the given id', fakeAsync(() => {
      let result: User | undefined;

      repository.getById('1').subscribe(user => (result = user));
      tick(MOCK_DELAY_MS);

      expect(result?.username).toBe('jdoe');
    }));

    it('should throw an error if the user does not exist', () => {
      let error: Error | undefined;

      repository.getById('999').subscribe({ error: e => (error = e) });

      expect(error?.message).toBe('User not found');
    });
  });

  describe('create', () => {
    const newUserData: UserFormData = {
      username: 'newuser',
      name: 'New',
      surnames: 'User',
      email: 'new@example.com',
      age: 28,
      active: true,
    };

    it('should return the created user with a generated id', fakeAsync(() => {
      let created: User | undefined;

      repository.create(newUserData).subscribe(user => (created = user));
      tick(MOCK_DELAY_MS);

      expect(created?.id).toBeTruthy();
    }));

    it('should set password to PENDING_ACTIVATION', fakeAsync(() => {
      let created: User | undefined;

      repository.create(newUserData).subscribe(user => (created = user));
      tick(MOCK_DELAY_MS);

      expect(created?.password).toBe('PENDING_ACTIVATION');
    }));

    it('should add the new user to the list', fakeAsync(() => {
      repository.create(newUserData).subscribe();
      tick(MOCK_DELAY_MS);

      let users: User[] = [];
      repository.getAll().subscribe(u => (users = u));
      tick(MOCK_DELAY_MS);

      expect(users.length).toBe(4);
      expect(users.find(u => u.username === 'newuser')).toBeTruthy();
    }));
  });

  describe('update', () => {
    it('should partially update the user keeping unchanged fields', fakeAsync(() => {
      let updated: User | undefined;

      repository.update('1', { name: 'Johnny' }).subscribe(user => (updated = user));
      tick(MOCK_DELAY_MS);

      expect(updated?.name).toBe('Johnny');
      expect(updated?.username).toBe('jdoe');
    }));

    it('should throw an error if the user does not exist', () => {
      let error: Error | undefined;

      repository.update('999', { name: 'X' }).subscribe({ error: e => (error = e) });

      expect(error?.message).toBe('User not found');
    });
  });

  describe('delete', () => {
    it('should remove the user from the list', fakeAsync(() => {
      repository.delete('1').subscribe();
      tick(MOCK_DELAY_MS);

      let users: User[] = [];
      repository.getAll().subscribe(u => (users = u));
      tick(MOCK_DELAY_MS);

      expect(users.find(u => u.id === '1')).toBeUndefined();
      expect(users.length).toBe(2);
    }));

    it('should throw an error if the user does not exist', () => {
      let error: Error | undefined;

      repository.delete('999').subscribe({ error: e => (error = e) });

      expect(error?.message).toBe('User not found');
    });
  });
});
