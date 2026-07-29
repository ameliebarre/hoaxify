import { BaseError } from './base.error';

export interface PasswordHashError extends BaseError {
  readonly type: 'PasswordHashError';
}

export interface PasswordCompareError extends BaseError {
  readonly type: 'PasswordCompareError';
}

export type PasswordError = PasswordHashError | PasswordCompareError;
