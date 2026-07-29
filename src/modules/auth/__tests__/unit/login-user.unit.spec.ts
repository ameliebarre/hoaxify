import { errAsync, okAsync } from 'neverthrow';

import { LoginUserUseCase } from '@modules/auth/use-cases/login-user.use-case';

import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import type { IPasswordService } from '@infrastructure/security/password/password.service.interface';
import type { IRefreshTokenRepository } from '@modules/auth/domain/refresh-token.repository.interface';
import type { IUserRepository } from '@modules/user/domain/user.repository.interface';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;

  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<IPasswordService>;
  let jwtService: jest.Mocked<IJwtService>;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;

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
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    refreshTokenRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      revoke: jest.fn(),
      revokeFamily: jest.fn(),
    };

    useCase = new LoginUserUseCase(
      userRepository,
      passwordService,
      jwtService,
      refreshTokenRepository,
    );
  });

  describe('Given a user exists with valid credentials', () => {
    beforeEach(() => {
      userRepository.findByEmail.mockReturnValue(okAsync(existingUser));

      passwordService.compare.mockReturnValue(okAsync(true));

      refreshTokenRepository.create.mockReturnValue(
        okAsync({
          id: 'refresh-token-id',
          userId: 1,
          familyId: 'family-id',
          revokedAt: null,
          replacedByTokenId: null,
          expiresAt: new Date(),
          createdAt: new Date(),
        }),
      );

      jwtService.generateAccessToken.mockReturnValue(okAsync('fake-token'));
      jwtService.generateRefreshToken.mockReturnValue(
        okAsync('fake-refresh-token'),
      );
    });

    describe('When the user logs in with correct credentials', () => {
      it('Then it should return user information, an access token and a refresh token', async () => {
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
          refreshToken: 'fake-refresh-token',
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

      it('Then it should persist a refresh token record for the user', async () => {
        await useCase.execute({
          email: 'john@mail.com',
          password: 'P4ssword',
        });

        expect(refreshTokenRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ userId: 1 }),
        );
      });

      it('Then it should generate a JWT access token with the user id', async () => {
        await useCase.execute({
          email: 'john@mail.com',
          password: 'P4ssword',
        });

        expect(jwtService.generateAccessToken).toHaveBeenCalledWith({
          userId: 1,
        });
      });

      it('Then it should generate a JWT refresh token bound to the persisted record', async () => {
        await useCase.execute({
          email: 'john@mail.com',
          password: 'P4ssword',
        });

        const [createdRecord] = refreshTokenRepository.create.mock.calls[0];

        expect(jwtService.generateRefreshToken).toHaveBeenCalledWith({
          userId: 1,
          jti: createdRecord.id,
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

        expect(jwtService.generateAccessToken).not.toHaveBeenCalled();
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

        expect(jwtService.generateAccessToken).not.toHaveBeenCalled();
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

  describe('Given valid credentials and refresh token persistence fails', () => {
    beforeEach(() => {
      userRepository.findByEmail.mockReturnValue(okAsync(existingUser));

      passwordService.compare.mockReturnValue(okAsync(true));

      refreshTokenRepository.create.mockReturnValue(
        errAsync({
          type: 'DatabaseError',
          message: 'Unable to persist refresh token',
        }),
      );
    });

    describe('When the user logs in', () => {
      it('Then it should return a database error', async () => {
        const result = await useCase.execute({
          email: 'john@mail.com',
          password: 'P4ssword',
        });

        expect(result.isErr()).toBe(true);

        expect(jwtService.generateAccessToken).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given valid credentials and JWT generation fails', () => {
    beforeEach(() => {
      userRepository.findByEmail.mockReturnValue(okAsync(existingUser));

      passwordService.compare.mockReturnValue(okAsync(true));

      refreshTokenRepository.create.mockReturnValue(
        okAsync({
          id: 'refresh-token-id',
          userId: 1,
          familyId: 'family-id',
          revokedAt: null,
          replacedByTokenId: null,
          expiresAt: new Date(),
          createdAt: new Date(),
        }),
      );

      jwtService.generateAccessToken.mockReturnValue(
        errAsync({
          type: 'JwtSignError',
          message: 'Unable to generate token',
        }),
      );
      jwtService.generateRefreshToken.mockReturnValue(
        okAsync('fake-refresh-token'),
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