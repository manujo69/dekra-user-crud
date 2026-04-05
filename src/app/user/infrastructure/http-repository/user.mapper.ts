// NOTE: In this project the DTO and domain model are nearly identical and the mapper
// is not strictly necessary. It is included to illustrate the pattern and to prepare
// for future API changes without touching the domain or UI layers.
import { User, UserFormData } from '@user/domain/user.model';
import { UserDto } from './user-http.dto';

export class UserMapper {
  static toDomain(dto: UserDto): User {
    return {
      id: dto.id,
      username: dto.username,
      name: dto.name,
      surnames: dto.surnames,
      email: dto.email,
      password: dto.password,
      age: dto.age,
      active: dto.active,
      lastLogin: dto.last_login ? new Date(dto.last_login) : undefined,
      createdAt: new Date(dto.created_at),
    };
  }

  // Only include defined fields to support partial PATCH requests.
  // Sending undefined fields would overwrite existing values on the backend.
  static toApi(data: Partial<UserFormData>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data.username !== undefined) result['username'] = data.username;
    if (data.name !== undefined) result['name'] = data.name;
    if (data.surnames !== undefined) result['surnames'] = data.surnames;
    if (data.email !== undefined) result['email'] = data.email;
    if (data.age !== undefined) result['age'] = data.age;
    if (data.active !== undefined) result['active'] = data.active;

    return result;
  }
}
