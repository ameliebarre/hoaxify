import { ResultAsync } from 'neverthrow';

import { JwtError } from '@infrastructure/security/jwt/jwt.error';
import { RefreshTokenPayload } from '@infrastructure/security/jwt/jwt.types';
import { AuthUser } from '@modules/auth/domain/auth.types';

export interface IJwtService {
  generateAccessToken(payload: AuthUser): ResultAsync<string, JwtError>;
  generateRefreshToken(
    payload: RefreshTokenPayload,
  ): ResultAsync<string, JwtError>;
  verifyAccessToken(token: string): ResultAsync<AuthUser, JwtError>;
  verifyRefreshToken(
    token: string,
  ): ResultAsync<RefreshTokenPayload, JwtError>;
}