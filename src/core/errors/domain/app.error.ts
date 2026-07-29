import {
  SignupAuthError,
  LoginAuthError,
} from '@/modules/auth/domain/errors/auth.error';
import { UserError } from '@/modules/user/domain/errors/user.error';

import { DatabaseError } from './database.error';
import { JwtError } from './jwt.error';
import { PasswordError } from './password.error';
import { UnauthorizedError } from './unauthorized.error';

export type AppError =
  | DatabaseError
  | PasswordError
  | JwtError
  | UnauthorizedError
  | SignupAuthError
  | LoginAuthError
  | UserError;
