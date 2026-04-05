export interface UserDto {
  id: string;
  username: string;
  name: string;
  surnames: string;
  email: string;
  password: string;
  age: number;
  active: boolean;
  last_login: string | null;
  created_at: string;
}
