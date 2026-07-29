import { DatabaseError } from '@core/errors/domain/database.error';
import { SignupAuthError } from '@modules/auth/domain/errors/auth.error';

import { PasswordError } from '@infrastructure/security/password/password.error';

export type SignupError = SignupAuthError | DatabaseError | PasswordError;
