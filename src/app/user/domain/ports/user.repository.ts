import { Observable } from "rxjs";
import { User } from "../models/user.model";

export abstract class UserRepository {
  abstract getAll(): Observable<User[]>;
  abstract getById(id: string): Observable<User>;
  abstract create(user: Omit<User, 'id' | 'createdAt'>): Observable<User>;
  abstract update(id: string, user: Partial<User>): Observable<User>;
  abstract delete(id: string): Observable<boolean>;
}
