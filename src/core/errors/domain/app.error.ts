import { DatabaseError } from '@core/errors/domain/database.error';
import { JwtError } from '@core/errors/domain/jwt.error';
import { PasswordError } from '@core/errors/domain/password.error';
import { UnauthorizedError } from '@core/errors/domain/unauthorized.error';
import {
  SignupAuthError,
  LoginAuthError,
} from '@modules/auth/domain/errors/auth.error';
import { RefreshTokenError } from '@modules/auth/domain/errors/refresh-token.error';
import { HoaxError } from '@modules/hoax/domain/errors/hoax.error';
import { UserError } from '@modules/user/domain/errors/user.error';

export type AppError =
  | DatabaseError
  | PasswordError
  | JwtError
  | UnauthorizedError
  | SignupAuthError
  | LoginAuthError
  | UserError
  | RefreshTokenError
  | HoaxError;
