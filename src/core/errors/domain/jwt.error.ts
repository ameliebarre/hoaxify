import { BaseError } from './base.error';

export interface JwtSignError extends BaseError {
  readonly type: 'JwtSignError';
}

export interface JwtVerifyError extends BaseError {
  readonly type: 'JwtVerifyError';
}

export type JwtError = JwtSignError | JwtVerifyError;
