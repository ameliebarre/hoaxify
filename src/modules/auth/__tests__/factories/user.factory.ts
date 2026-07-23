import { User } from '@modules/user/domain/user.types';

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'john',
    email: 'john@mail.com',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
