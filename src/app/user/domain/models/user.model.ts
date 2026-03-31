export interface User {
  id: string;
  username: string;
  name: string;
  surnames: string;
  email: string;
  password: string;
  age: number;
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
}
