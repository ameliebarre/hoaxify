import { DatabaseError } from '@core/errors/domain/database.error';
import { PasswordError } from '@infrastructure/security/password/password.error';
import { SignupAuthError } from '@modules/auth/domain/errors/auth.error';


export type SignupError = SignupAuthError | DatabaseError | PasswordError;
