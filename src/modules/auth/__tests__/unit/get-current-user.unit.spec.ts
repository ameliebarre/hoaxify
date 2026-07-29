import { okAsync } from 'neverthrow';

import { GetCurrentUserUseCase } from '@modules/auth/use-cases/get-current-user.use-case';

import type { IUserRepository } from '@modules/user/domain/user.repository.interface';

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const userId = 1;

  const existingUser = {
    id: 1,
    username: 'john',
    email: 'john@mail.com',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: null,
  };

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new GetCurrentUserUseCase(userRepository);
  });

  describe('Given the user exists', () => {
    beforeEach(() => {
      userRepository.findById.mockReturnValue(okAsync(existingUser));
    });

    describe('When retrieving the current user', () => {
      it('Then it should return the public user information', async () => {
        const result = await useCase.execute(userId);

        expect(result.isOk()).toBe(true);

        expect(result._unsafeUnwrap()).toEqual({
          id: 1,
          username: 'john',
          email: 'john@mail.com',
        });
      });

      it('Then it should retrieve the user by id', async () => {
        await useCase.execute(userId);

        expect(userRepository.findById).toHaveBeenCalledWith(userId);
      });
    });
  });

  describe('Given the user does not exist', () => {
    beforeEach(() => {
      userRepository.findById.mockReturnValue(okAsync(null));
    });

    describe('When retrieving the current user', () => {
      it('Then it should return a UserNotFound error', async () => {
        const result = await useCase.execute(userId);

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'UserNotFound',
        });
      });
    });
  });
});
