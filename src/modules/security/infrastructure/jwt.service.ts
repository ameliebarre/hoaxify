import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';

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
    return jwt.verify(token, process.env.JWT_SECRET!) as AccessTokenPayload;
  }
}
