import jwt from 'jsonwebtoken';
import { ResultAsync } from 'neverthrow';
import { injectable } from 'tsyringe';

import env from '@core/config/env';

import type { JwtError } from '@infrastructure/security/jwt/jwt.error';
import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';

@injectable()
export class JwtService implements IJwtService {
  sign(payload: { userId: number }): ResultAsync<string, JwtError> {
    return ResultAsync.fromPromise(
      Promise.resolve().then(() =>
        jwt.sign(payload, env.JWT_SECRET, {
          expiresIn: '15m',
        }),
      ),
      (error): JwtError => ({
        type: 'JwtSignError',
        message: String(error),
      }),
    );
  }

  verify(token: string): ResultAsync<{ userId: number }, JwtError> {
    return ResultAsync.fromPromise(
      Promise.resolve().then(
        () =>
          jwt.verify(token, env.JWT_SECRET) as {
            userId: number;
          },
      ),
      (error): JwtError => ({
        type: 'JwtVerifyError',
        message: String(error),
      }),
    ).map((payload) => ({
      userId: payload.userId,
    }));
  }
}
