// src/app/user/infrastructure/repositories/user-mock.repository.ts

import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UserRepository } from '../../domain/user.repository';
import { User, UserFormData } from '../../domain/user.model';
import { users_mock } from './user-mock.data';

@Injectable()
export class UserMockRepository extends UserRepository {
  private users = signal<User[]>(users_mock);

  getAll(): Observable<User[]> {
    return of(this.users()).pipe(delay(300));
  }

  getById(id: string): Observable<User> {
    const user = this.users().find(u => u.id === id);

    if (!user) {
      return throwError(() => new Error('User not found'));
    }

    return of(user).pipe(delay(200));
  }

  create(userData: UserFormData): Observable<User> {
    const newUser: User = {
      ...userData,
      password: 'PENDING_ACTIVATION',
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    this.users.update(users => [...users, newUser]);

    return of(newUser).pipe(delay(400));
  }

  update(id: string, userData: Partial<UserFormData>): Observable<User> {
    const index = this.users().findIndex(u => u.id === id);

    if (index === -1) {
      return throwError(() => new Error('User not found'));
    }

    this.users.update(users => {
      const updated = [...users];
      updated[index] = { ...updated[index], ...userData };
      return updated;
    });

    return of(this.users()[index]).pipe(delay(400));
  }

  delete(id: string): Observable<boolean> {
    const exists = this.users().some(u => u.id === id);

    if (!exists) {
      return throwError(() => new Error('User not found'));
    }

    this.users.update(users => users.filter(u => u.id !== id));

    return of(true).pipe(delay(300));
  }
}
