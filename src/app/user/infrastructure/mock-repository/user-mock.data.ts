import { User } from '@user/domain/user.model';

export const users_mock: User[] = [
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
    createdAt: new Date('2025-01-15T08:00:00'),
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
    createdAt: new Date('2025-02-20T10:00:00'),
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
    createdAt: new Date('2025-03-10T14:00:00'),
  },
];
