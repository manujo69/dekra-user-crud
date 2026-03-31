// src/app/user/infrastructure/repositories/user-mock.repository.ts

import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UserRepository } from '../../domain/ports/user.repository';
import { User } from '../../domain/models/user.model';

@Injectable()
export class UserMockRepository extends UserRepository {

  private users = signal<User[]>([
    {
      id: '1',
      username: 'jdoe',
      name: 'John',
      surnames: 'Doe',
      email: 'john.doe@example.com',
      password: '$2a$10$hashedpassword1',
      age: 30,
      active: true,
      lastLogin: new Date('2026-03-30T10:00:00'),
      createdAt: new Date('2025-01-15T08:00:00')
    },
    {
      id: '2',
      username: 'asmith',
      name: 'Alice',
      surnames: 'Smith',
      email: 'alice.smith@example.com',
      password: '$2a$10$hashedpassword2',
      age: 25,
      active: true,
      lastLogin: new Date('2026-03-31T09:30:00'),
      createdAt: new Date('2025-02-20T10:00:00')
    },
    {
      id: '3',
      username: 'bwilson',
      name: 'Bob',
      surnames: 'Wilson',
      email: 'bob.wilson@example.com',
      password: '$2a$10$hashedpassword3',
      age: 45,
      active: false,
      createdAt: new Date('2025-03-10T14:00:00')
    }
  ]);

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

  create(userData: Omit<User, 'id' | 'createdAt'>): Observable<User> {
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };

    this.users.update(users => [...users, newUser]);

    return of(newUser).pipe(delay(400));
  }

  update(id: string, userData: Partial<User>): Observable<User> {
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
