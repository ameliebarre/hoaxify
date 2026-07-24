import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';

import env from '@core/config/env';
import { UnauthorizedError } from '@core/errors/unauthorized-error';
import { ITokenService } from '@infrastructure/security/domain/token.service.interface';
import { AccessTokenPayload } from '@infrastructure/security/domain/token.types';

@injectable()
export class JwtService implements ITokenService {
  generateAccessToken(payload: object): string {
    return jwt.sign(payload, env.JWT_SECRET!, {
      expiresIn: '15m',
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET!) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedError();
    }
  }
}
