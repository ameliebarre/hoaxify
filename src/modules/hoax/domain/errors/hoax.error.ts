import { BaseError } from '@core/errors/domain/base.error';

export interface HoaxNotFoundError extends BaseError {
  readonly type: 'HoaxNotFound';
}

export interface UnauthorizedHoaxDeletionError extends BaseError {
  readonly type: 'UnauthorizedHoaxDeletion';
}

export type HoaxError = HoaxNotFoundError | UnauthorizedHoaxDeletionError;
