import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UsernameAlreadyExistsError,
} from '@modules/auth/domain/errors/auth.error';

export const AuthErrors = {
  emailAlreadyExists(email: string): EmailAlreadyExistsError {
    return {
      type: 'EmailAlreadyExists',
      message: `The email "${email}" is already in use.`,
    };
  },

  usernameAlreadyExists(username: string): UsernameAlreadyExistsError {
    return {
      type: 'UsernameAlreadyExists',
      message: `The username "${username}" is already in use.`,
    };
  },

  invalidCredentials(): InvalidCredentialsError {
    return {
      type: 'InvalidCredentials',
      message: 'Invalid email or password.',
    };
  },
} as const;
