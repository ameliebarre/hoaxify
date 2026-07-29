import { UserRepository } from '../../infrastructure/user.repository';

export const createUser = async (repository: UserRepository) => {
  const result = await repository.create({
    username: 'john',
    email: 'john@mail.com',
    password: 'hashed-password',
  });

  return result._unsafeUnwrap();
};
