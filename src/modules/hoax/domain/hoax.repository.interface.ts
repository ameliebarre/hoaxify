import { DatabaseError } from '@core/errors/domain/database.error';
import { ResultAsync } from 'neverthrow';

import { Hoax, HoaxWithAuthor, NewHoax } from '@modules/hoax/domain/hoax.types';

export interface FindManyHoaxesParams {
  page: number;
  size: number;
  userId?: number;
}

export interface FindManyHoaxesResult {
  hoaxes: HoaxWithAuthor[];
  totalCount: number;
}

export interface IHoaxRepository {
  create(hoax: NewHoax): ResultAsync<Hoax, DatabaseError>;
  findMany(
    params: FindManyHoaxesParams,
  ): ResultAsync<FindManyHoaxesResult, DatabaseError>;
}
