import { BaseError } from './base.error';

export interface UnauthorizedError extends BaseError {
  readonly type: 'Unauthorized';
}
