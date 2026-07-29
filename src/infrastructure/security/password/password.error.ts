export interface PasswordHashError {
  type: 'PasswordHashError';
  message: string;
}

export interface PasswordCompareError {
  type: 'PasswordCompareError';
  message: string;
}

export type PasswordError = PasswordHashError | PasswordCompareError;
