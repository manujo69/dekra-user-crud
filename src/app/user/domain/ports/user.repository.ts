import { Observable } from "rxjs";
import { User, UserFormData } from "../models/user.model";

export abstract class UserRepository {
  abstract getAll(): Observable<User[]>;
  abstract getById(id: string): Observable<User>;
  abstract create(userData: UserFormData): Observable<User>;
  abstract update(id: string, userData: Partial<UserFormData>): Observable<User>;
  abstract delete(id: string): Observable<boolean>;
}
