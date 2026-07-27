import { UserRepository } from '../../infrastructure/user.repository';

export async function createUser(repository: UserRepository) {
  return await repository.create({
    username: 'john',
    email: 'john@mail.com',
    password: 'hashed-password',
  });
}
