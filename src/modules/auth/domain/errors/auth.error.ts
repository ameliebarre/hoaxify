import { BaseError } from '@core/errors/domain/base.error';

export interface EmailAlreadyExistsError extends BaseError {
  readonly type: 'EmailAlreadyExists';
}

export interface UsernameAlreadyExistsError extends BaseError {
  readonly type: 'UsernameAlreadyExists';
}

export interface InvalidCredentialsError extends BaseError {
  readonly type: 'InvalidCredentials';
}

export type LoginAuthError = InvalidCredentialsError;

export type SignupAuthError =
  EmailAlreadyExistsError | UsernameAlreadyExistsError;
