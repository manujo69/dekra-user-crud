import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UserRepository } from '@user/domain/user.repository';
import { User, UserFormData } from '@user/domain/user.model';
import { users_mock } from './user-mock.data';
import { MOCK_DEFAULTS, USER_MESSAGES } from '@user/constants/user-messages';

// Artificial delays simulate real network latency and help surface
// race conditions or loading-state issues during development.
export const MOCK_DELAY_MS = 400;

@Injectable()
export class UserMockRepository extends UserRepository {
  private users = signal<User[]>(users_mock);

  getAll(): Observable<User[]> {
    return of(this.users()).pipe(delay(MOCK_DELAY_MS));
  }

  getById(id: string): Observable<User> {
    const user = this.users().find(u => u.id === id);

    if (!user) {
      return throwError(() => new Error(USER_MESSAGES.errors.notFound));
    }

    return of(user).pipe(delay(MOCK_DELAY_MS));
  }

  create(userData: UserFormData): Observable<User> {
    const newUser: User = {
      ...userData,
      password: MOCK_DEFAULTS.pendingPassword,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    this.users.update(users => [...users, newUser]);

    return of(newUser).pipe(delay(MOCK_DELAY_MS));
  }

  update(id: string, userData: Partial<UserFormData>): Observable<User> {
    const index = this.users().findIndex(u => u.id === id);

    if (index === -1) {
      return throwError(() => new Error(USER_MESSAGES.errors.notFound));
    }

    this.users.update(users => {
      const updated = [...users];
      updated[index] = { ...updated[index], ...userData };
      return updated;
    });

    return of(this.users()[index]).pipe(delay(MOCK_DELAY_MS));
  }

  delete(id: string): Observable<boolean> {
    const exists = this.users().some(u => u.id === id);

    if (!exists) {
      return throwError(() => new Error(USER_MESSAGES.errors.notFound));
    }

    this.users.update(users => users.filter(u => u.id !== id));

    return of(true).pipe(delay(MOCK_DELAY_MS));
  }
}
