import { errAsync, okAsync } from 'neverthrow';

import { LogoutUseCase } from '@modules/auth/use-cases/logout.use-case';

import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import type { IRefreshTokenRepository } from '@modules/auth/domain/refresh-token.repository.interface';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;

  let jwtService: jest.Mocked<IJwtService>;
  let refreshTokenRepository: jest.Mocked<IRefreshTokenRepository>;

  beforeEach(() => {
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

    useCase = new LogoutUseCase(jwtService, refreshTokenRepository);
  });

  describe('Given no refresh token is provided', () => {
    describe('When logging out', () => {
      it('Then it should succeed without calling the JWT service', async () => {
        const result = await useCase.execute(undefined);

        expect(result.isOk()).toBe(true);

        expect(jwtService.verifyRefreshToken).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given a valid refresh token', () => {
    beforeEach(() => {
      jwtService.verifyRefreshToken.mockReturnValue(
        okAsync({ userId: 1, jti: 'some-jti' }),
      );

      refreshTokenRepository.revoke.mockReturnValue(okAsync(undefined));
    });

    describe('When logging out', () => {
      it('Then it should revoke the associated refresh token record', async () => {
        const result = await useCase.execute('some-token');

        expect(result.isOk()).toBe(true);

        expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(
          'some-jti',
        );
      });
    });
  });

  describe('Given an invalid or expired refresh token', () => {
    beforeEach(() => {
      jwtService.verifyRefreshToken.mockReturnValue(
        errAsync({ type: 'JwtVerifyError', message: 'invalid token' }),
      );
    });

    describe('When logging out', () => {
      it('Then it should still succeed', async () => {
        const result = await useCase.execute('some-token');

        expect(result.isOk()).toBe(true);

        expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the revocation itself fails', () => {
    beforeEach(() => {
      jwtService.verifyRefreshToken.mockReturnValue(
        okAsync({ userId: 1, jti: 'some-jti' }),
      );

      refreshTokenRepository.revoke.mockReturnValue(
        errAsync({ type: 'DatabaseError', message: 'db unavailable' }),
      );
    });

    describe('When logging out', () => {
      it('Then it should still succeed', async () => {
        const result = await useCase.execute('some-token');

        expect(result.isOk()).toBe(true);
      });
    });
  });
});