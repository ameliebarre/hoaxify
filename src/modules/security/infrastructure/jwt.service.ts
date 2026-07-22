import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';

import { UnauthorizedError } from '@/errors/unauthorized-error';

import { ITokenService } from '../domain/token.service.interface';
import { AccessTokenPayload } from '../token.types';

@injectable()
export class JwtService implements ITokenService {
  generateAccessToken(payload: object): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}
