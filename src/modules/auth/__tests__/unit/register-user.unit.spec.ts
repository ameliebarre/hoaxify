import { okAsync } from 'neverthrow';

import { createUser } from '@modules/auth/__tests__/factories/user.factory';
import { RegisterUserUseCase } from '@modules/auth/use-cases/register-user.use-case';

import type { IPasswordService } from '@infrastructure/security/password/password.service.interface';
import type { IUserRepository } from '@modules/user/domain/user.repository.interface';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<IPasswordService>;

  const signupData = {
    username: 'john',
    email: 'john@mail.com',
    password: 'P4ssword',
  };

  const persistedUser = {
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

    passwordService = {
      hash: jest.fn(),
      compare: jest.fn(),
      compareOrDummy: jest.fn(),
    };

    useCase = new RegisterUserUseCase(userRepository, passwordService);
  });

  describe('Given the email and username are available', () => {
    beforeEach(() => {
      userRepository.findByEmail.mockReturnValue(okAsync(null));

      userRepository.findByUsername.mockReturnValue(okAsync(null));

      passwordService.hash.mockReturnValue(okAsync('hashed-password'));

      userRepository.create.mockReturnValue(okAsync(persistedUser));
    });

    describe('When registering a new user', () => {
      it('Then it should return the registered user', async () => {
        const result = await useCase.execute(signupData);

        expect(result.isOk()).toBe(true);

        expect(result._unsafeUnwrap()).toEqual({
          id: 1,
          username: 'john',
          email: 'john@mail.com',
        });
      });

      it('Then it should verify that the email is available', async () => {
        await useCase.execute(signupData);

        expect(userRepository.findByEmail).toHaveBeenCalledWith(
          signupData.email,
        );
      });

      it('Then it should verify that the username is available', async () => {
        await useCase.execute(signupData);

        expect(userRepository.findByUsername).toHaveBeenCalledWith(
          signupData.username,
        );
      });

      it('Then it should hash the password', async () => {
        await useCase.execute(signupData);

        expect(passwordService.hash).toHaveBeenCalledWith(signupData.password);
      });

      it('Then it should create the user with the hashed password', async () => {
        await useCase.execute(signupData);

        expect(userRepository.create).toHaveBeenCalledWith({
          ...signupData,
          password: 'hashed-password',
        });
      });
    });
  });

  describe('Given the email already exists', () => {
    beforeEach(() => {
      userRepository.findByEmail.mockReturnValue(
        okAsync(createUser({ username: 'existing-user' })),
      );
    });

    describe('When registering a new user', () => {
      it('Then it should return an EmailAlreadyExists error', async () => {
        const result = await useCase.execute(signupData);

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'EmailAlreadyExists',
        });
      });

      it('Then it should not check the username', async () => {
        await useCase.execute(signupData);

        expect(userRepository.findByUsername).not.toHaveBeenCalled();
      });

      it('Then it should not hash the password', async () => {
        await useCase.execute(signupData);

        expect(passwordService.hash).not.toHaveBeenCalled();
      });

      it('Then it should not create the user', async () => {
        await useCase.execute(signupData);

        expect(userRepository.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the username already exists', () => {
    beforeEach(() => {
      userRepository.findByEmail.mockReturnValue(okAsync(null));

      userRepository.findByUsername.mockReturnValue(okAsync(createUser()));
    });

    describe('When registering a new user', () => {
      it('Then it should return a UsernameAlreadyExists error', async () => {
        const result = await useCase.execute(signupData);

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'UsernameAlreadyExists',
        });
      });

      it('Then it should not hash the password', async () => {
        await useCase.execute(signupData);

        expect(passwordService.hash).not.toHaveBeenCalled();
      });

      it('Then it should not create the user', async () => {
        await useCase.execute(signupData);

        expect(userRepository.create).not.toHaveBeenCalled();
      });
    });
  });
});
