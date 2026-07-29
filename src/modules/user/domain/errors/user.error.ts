import { BaseError } from '@core/errors/domain/base.error';

export interface UserNotFoundError extends BaseError {
  readonly type: 'UserNotFound';
}

export type UserError = UserNotFoundError;
