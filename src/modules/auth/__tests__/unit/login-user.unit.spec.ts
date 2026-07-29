import { errAsync, okAsync } from 'neverthrow';

import { LoginUserUseCase } from '@modules/auth/use-cases/login-user.use-case';

import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import type { IPasswordService } from '@infrastructure/security/password/password.service.interface';
import type { IUserRepository } from '@modules/user/domain/user.repository.interface';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;

  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<IPasswordService>;
  let jwtService: jest.Mocked<IJwtService>;

  const existingUser = {
    id: 1,
    username: 'john',
    email: 'john@mail.com',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
    };

    passwordService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    useCase = new LoginUserUseCase(userRepository, passwordService, jwtService);
  });

  describe('Given a user exists with valid credentials', () => {
    beforeEach(() => {
      userRepository.findByEmail.mockReturnValue(okAsync(existingUser));

      passwordService.compare.mockReturnValue(okAsync(true));

      jwtService.sign.mockReturnValue(okAsync('fake-token'));
    });

    describe('When the user logs in with correct credentials', () => {
      it('Then it should return user information and an access token', async () => {
        const result = await useCase.execute({
          email: 'john@mail.com',
          password: 'P4ssword',
        });

        expect(result.isOk()).toBe(true);

        expect(result._unsafeUnwrap()).toEqual({
          user: {
            id: 1,
            username: 'john',
            email: 'john@mail.com',
          },
          accessToken: 'fake-token',
        });
      });

      it('Then it should compare the password with the stored hash', async () => {
        await useCase.execute({
          email: 'john@mail.com',
          password: 'P4ssword',
        });

        expect(passwordService.compare).toHaveBeenCalledWith(
          'P4ssword',
          'hashed-password',
        );
      });

      it('Then it should generate a JWT token with the user id', async () => {
        await useCase.execute({
          email: 'john@mail.com',
          password: 'P4ssword',
        });

        expect(jwtService.sign).toHaveBeenCalledWith({
          userId: 1,
        });
      });
    });
  });

  describe('Given no user exists with the provided email', () => {
    beforeEach(() => {
      userRepository.findByEmail.mockReturnValue(okAsync(null));
    });

    describe('When the user tries to login', () => {
      it('Then it should return an unauthorized error', async () => {
        const result = await useCase.execute({
          email: 'unknown@mail.com',
          password: 'P4ssword',
        });

        expect(result.isErr()).toBe(true);

        const error = result._unsafeUnwrapErr();

        expect(error).toMatchObject({
          type: 'InvalidCredentials',
        });
      });

      it('Then it should not compare the password', async () => {
        await useCase.execute({
          email: 'unknown@mail.com',
          password: 'P4ssword',
        });

        expect(passwordService.compare).not.toHaveBeenCalled();

        expect(jwtService.sign).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given a user exists with an invalid password', () => {
    beforeEach(() => {
      userRepository.findByEmail.mockReturnValue(okAsync(existingUser));

      passwordService.compare.mockReturnValue(okAsync(false));
    });

    describe('When the user logs in with an incorrect password', () => {
      it('Then it should return an unauthorized error', async () => {
        const result = await useCase.execute({
          email: 'john@mail.com',
          password: 'WrongPassword',
        });

        expect(result.isErr()).toBe(true);

        const error = result._unsafeUnwrapErr();

        expect(error).toMatchObject({
          type: 'InvalidCredentials',
        });
      });

      it('Then it should not generate an access token', async () => {
        await useCase.execute({
          email: 'john@mail.com',
          password: 'WrongPassword',
        });

        expect(jwtService.sign).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given a user exists and password validation fails', () => {
    beforeEach(() => {
      userRepository.findByEmail.mockReturnValue(okAsync(existingUser));

      passwordService.compare.mockReturnValue(
        errAsync({
          type: 'PasswordCompareError',
          message: 'Unable to compare password',
        }),
      );
    });

    describe('When the user logs in', () => {
      it('Then it should propagate the password error', async () => {
        const result = await useCase.execute({
          email: 'john@mail.com',
          password: 'P4ssword',
        });

        expect(result.isErr()).toBe(true);
      });
    });
  });

  describe('Given valid credentials and JWT generation fails', () => {
    beforeEach(() => {
      userRepository.findByEmail.mockReturnValue(okAsync(existingUser));

      passwordService.compare.mockReturnValue(okAsync(true));

      jwtService.sign.mockReturnValue(
        errAsync({
          type: 'JwtSignError',
          message: 'Unable to generate token',
        }),
      );
    });

    describe('When the user logs in', () => {
      it('Then it should return a JWT error', async () => {
        const result = await useCase.execute({
          email: 'john@mail.com',
          password: 'P4ssword',
        });

        expect(result.isErr()).toBe(true);
      });
    });
  });
});
