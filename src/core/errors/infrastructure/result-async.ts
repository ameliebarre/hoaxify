import { DatabaseError } from '@core/errors/domain/database.error';
import { ResultAsync } from 'neverthrow';

export function fromDatabasePromise<T>(
  promise: Promise<T>,
): ResultAsync<T, DatabaseError> {
  return ResultAsync.fromPromise(promise, (error) => ({
    type: 'DatabaseError',
    message: String(error),
  }));
}
