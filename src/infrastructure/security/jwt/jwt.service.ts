import jwt, { SignOptions } from 'jsonwebtoken';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { injectable } from 'tsyringe';

import env from '@core/config/env';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '@core/config/token-ttl';
import { AuthUser } from '@modules/auth/domain/auth.types';

import type { JwtError } from '@infrastructure/security/jwt/jwt.error';
import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import type { RefreshTokenPayload } from '@infrastructure/security/jwt/jwt.types';

@injectable()
export class JwtService implements IJwtService {
  generateAccessToken(payload: AuthUser): ResultAsync<string, JwtError> {
    return this.sign(
      { ...payload, type: 'access' },
      env.ACCESS_SECRET,
      ACCESS_TOKEN_TTL,
    );
  }

  generateRefreshToken(
    payload: RefreshTokenPayload,
  ): ResultAsync<string, JwtError> {
    return this.sign(
      { ...payload, type: 'refresh' },
      env.REFRESH_SECRET,
      REFRESH_TOKEN_TTL,
    );
  }

  verifyAccessToken(token: string): ResultAsync<AuthUser, JwtError> {
    return this.verify(token, env.ACCESS_SECRET).andThen((payload) => {
      if (typeof payload.userId !== 'number' || payload.type !== 'access') {
        return errAsync(
          this.toJwtError('JwtVerifyError')(new Error('Invalid JWT payload')),
        );
      }

      return okAsync({ userId: payload.userId });
    });
  }

  verifyRefreshToken(
    token: string,
  ): ResultAsync<RefreshTokenPayload, JwtError> {
    return this.verify(token, env.REFRESH_SECRET).andThen((payload) => {
      if (
        typeof payload.userId !== 'number' ||
        typeof payload.jti !== 'string' ||
        payload.type !== 'refresh'
      ) {
        return errAsync(
          this.toJwtError('JwtVerifyError')(new Error('Invalid JWT payload')),
        );
      }

      return okAsync({ userId: payload.userId, jti: payload.jti });
    });
  }

  private toJwtError(type: JwtError['type']) {
    return (error: unknown): JwtError => ({
      type,
      message: String(error),
    });
  }

  private sign(
    payload: object,
    secret: string,
    expiresIn: SignOptions['expiresIn'],
  ): ResultAsync<string, JwtError> {
    return ResultAsync.fromPromise(
      Promise.resolve().then(() =>
        jwt.sign(payload, secret, { expiresIn, algorithm: 'HS256' }),
      ),
      this.toJwtError('JwtSignError'),
    );
  }

  private verify(
    token: string,
    secret: string,
  ): ResultAsync<Record<string, unknown>, JwtError> {
    return ResultAsync.fromPromise(
      Promise.resolve().then(() => {
        const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });

        if (typeof payload !== 'object' || payload === null) {
          throw new Error('Invalid JWT payload');
        }

        return payload as Record<string, unknown>;
      }),
      this.toJwtError('JwtVerifyError'),
    );
  }
}