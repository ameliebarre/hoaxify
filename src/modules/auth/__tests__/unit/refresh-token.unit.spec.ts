import { errAsync, okAsync } from 'neverthrow';

import { RefreshTokenUseCase } from '@modules/auth/use-cases/refresh-token.use-case';

import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import type { IRefreshTokenRepository } from '@modules/auth/domain/refresh-token.repository.interface';
import type { IUserRepository } from '@modules/user/domain/user.repository.interface';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  let userRepository: jest.Mocked<IUserRepository>;
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

  const rotatedRecord = {
    id: 'new-jti',
    userId: 1,
    familyId: 'family-id',
    revokedAt: null,
    replacedByTokenId: null,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    createdAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
      create: jest.fn(),
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
      rotate: jest.fn(),
    };

    useCase = new RefreshTokenUseCase(
      userRepository,
      jwtService,
      refreshTokenRepository,
    );
  });

  describe('Given no refresh token is provided', () => {
    describe('When refreshing the session', () => {
      it('Then it should return an invalid refresh token error', async () => {
        const result = await useCase.execute('');

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'InvalidRefreshToken',
        });

        expect(jwtService.verifyRefreshToken).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the refresh token signature is invalid', () => {
    beforeEach(() => {
      jwtService.verifyRefreshToken.mockReturnValue(
        errAsync({ type: 'JwtVerifyError', message: 'invalid signature' }),
      );
    });

    describe('When refreshing the session', () => {
      it('Then it should propagate the JWT error', async () => {
        const result = await useCase.execute('some-token');

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'JwtVerifyError',
        });

        expect(userRepository.findById).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the user no longer exists', () => {
    beforeEach(() => {
      jwtService.verifyRefreshToken.mockReturnValue(
        okAsync({ userId: 1, jti: 'old-jti' }),
      );

      userRepository.findById.mockReturnValue(okAsync(null));
    });

    describe('When refreshing the session', () => {
      it('Then it should return a user not found error without attempting rotation', async () => {
        const result = await useCase.execute('some-token');

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'UserNotFound',
        });

        expect(refreshTokenRepository.rotate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the refresh token id is unknown to the repository', () => {
    beforeEach(() => {
      jwtService.verifyRefreshToken.mockReturnValue(
        okAsync({ userId: 1, jti: 'unknown-jti' }),
      );

      userRepository.findById.mockReturnValue(okAsync(existingUser));

      refreshTokenRepository.rotate.mockReturnValue(okAsync(null));

      refreshTokenRepository.findById.mockReturnValue(okAsync(null));
    });

    describe('When refreshing the session', () => {
      it('Then it should return an invalid refresh token error without touching any family', async () => {
        const result = await useCase.execute('some-token');

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'InvalidRefreshToken',
        });

        expect(refreshTokenRepository.revokeFamily).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the refresh token was already rotated (or is being replayed concurrently)', () => {
    beforeEach(() => {
      jwtService.verifyRefreshToken.mockReturnValue(
        okAsync({ userId: 1, jti: 'old-jti' }),
      );

      userRepository.findById.mockReturnValue(okAsync(existingUser));

      // The atomic claim fails: the token is already revoked (by a prior
      // rotation or by a concurrent request that won the race).
      refreshTokenRepository.rotate.mockReturnValue(okAsync(null));

      refreshTokenRepository.findById.mockReturnValue(
        okAsync({
          ...rotatedRecord,
          id: 'old-jti',
          revokedAt: new Date(),
        }),
      );

      refreshTokenRepository.revokeFamily.mockReturnValue(okAsync(undefined));
    });

    describe('When it is presented again', () => {
      it('Then it should revoke the whole token family', async () => {
        await useCase.execute('some-token');

        expect(refreshTokenRepository.revokeFamily).toHaveBeenCalledWith(
          'family-id',
        );
      });

      it('Then it should return an invalid refresh token error', async () => {
        const result = await useCase.execute('some-token');

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'InvalidRefreshToken',
        });
      });
    });
  });

  describe('Given a valid, active refresh token', () => {
    beforeEach(() => {
      jwtService.verifyRefreshToken.mockReturnValue(
        okAsync({ userId: 1, jti: 'old-jti' }),
      );

      userRepository.findById.mockReturnValue(okAsync(existingUser));

      refreshTokenRepository.rotate.mockReturnValue(okAsync(rotatedRecord));

      jwtService.generateAccessToken.mockReturnValue(
        okAsync('new-access-token'),
      );
      jwtService.generateRefreshToken.mockReturnValue(
        okAsync('new-refresh-token'),
      );
    });

    describe('When refreshing the session', () => {
      it('Then it should return a new access token and a new refresh token', async () => {
        const result = await useCase.execute('some-token');

        expect(result.isOk()).toBe(true);

        expect(result._unsafeUnwrap()).toEqual({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        });
      });

      it('Then it should attempt an atomic rotation of the old token', async () => {
        await useCase.execute('some-token');

        expect(refreshTokenRepository.rotate).toHaveBeenCalledWith(
          expect.objectContaining({ oldId: 'old-jti', userId: 1 }),
        );
      });

      it('Then it should sign the new refresh token with the id passed to rotation', async () => {
        await useCase.execute('some-token');

        const [rotateParams] = refreshTokenRepository.rotate.mock.calls[0];

        expect(jwtService.generateRefreshToken).toHaveBeenCalledWith({
          userId: 1,
          jti: rotateParams.newId,
        });
      });

      it('Then it should not look up the old record or touch any family', async () => {
        await useCase.execute('some-token');

        expect(refreshTokenRepository.findById).not.toHaveBeenCalled();
        expect(refreshTokenRepository.revokeFamily).not.toHaveBeenCalled();
      });
    });
  });
});