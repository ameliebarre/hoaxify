import { BaseError } from './base.error';

export interface DatabaseError extends BaseError {
  readonly type: 'DatabaseError';
}
