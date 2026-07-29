import { UserNotFoundError } from '@modules/user/domain/errors/user.error';

import { BaseError } from '@core/errors/domain/base.error';

import type { DatabaseError } from '@core/errors/domain/database.error';
import type { JwtError } from '@infrastructure/security/jwt/jwt.error';

export interface InvalidRefreshToken extends BaseError {
  readonly type: 'InvalidRefreshToken';
}

export type RefreshTokenError =
  JwtError | UserNotFoundError | DatabaseError | InvalidRefreshToken;
