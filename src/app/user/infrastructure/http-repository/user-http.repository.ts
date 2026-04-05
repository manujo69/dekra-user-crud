import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { User, UserFormData } from '@user/domain/user.model';
import { UserRepository } from '@user/domain/user.repository';
import { UserDto } from './user-http.dto';
import { UserMapper } from './user.mapper';
import { USER_MESSAGES } from '@user/constants/user-messages';

@Injectable()
export class UserHttpRepository extends UserRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<UserDto[]>(this.baseUrl).pipe(
      map(dtos => dtos.map(UserMapper.toDomain)),
      catchError(this.handleError),
    );
  }

  getById(id: string): Observable<User> {
    return this.http
      .get<UserDto>(`${this.baseUrl}/${id}`)
      .pipe(map(UserMapper.toDomain), catchError(this.handleError));
  }

  create(userData: UserFormData): Observable<User> {
    return this.http
      .post<UserDto>(this.baseUrl, UserMapper.toApi(userData))
      .pipe(map(UserMapper.toDomain), catchError(this.handleError));
  }

  update(id: string, userData: Partial<UserFormData>): Observable<User> {
    return this.http
      .patch<UserDto>(`${this.baseUrl}/${id}`, UserMapper.toApi(userData))
      .pipe(map(UserMapper.toDomain), catchError(this.handleError));
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 404) {
      return throwError(() => new Error(USER_MESSAGES.errors.notFound));
    }
    return throwError(() => new Error(`HTTP error ${error.status}: ${error.message}`));
  }
}
