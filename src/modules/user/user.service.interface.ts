import { User } from './user.types';

export interface IUserService {
  getByEmail(email: string): Promise<User | null>;
  createUser(data: User): Promise<User>;
}
