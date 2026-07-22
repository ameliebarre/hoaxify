import { NewUser, User } from './user.types';

export interface IUserRepository {
  create(user: NewUser): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}
