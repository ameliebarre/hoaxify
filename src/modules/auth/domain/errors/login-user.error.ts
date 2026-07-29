import { DatabaseError } from '@core/errors/domain/database.error';
import { LoginAuthError } from '@modules/auth/domain/errors/auth.error';

import { JwtError } from '@core/errors/domain/jwt.error';
import { PasswordError } from '@core/errors/domain/password.error';

export type LoginError =
  LoginAuthError | DatabaseError | PasswordError | JwtError;
