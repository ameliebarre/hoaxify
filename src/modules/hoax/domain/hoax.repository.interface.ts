import { ResultAsync } from 'neverthrow';

import { DatabaseError } from '@core/errors/domain/database.error';
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
  findById(id: number): ResultAsync<Hoax | null, DatabaseError>;
  deleteById(id: number): ResultAsync<void, DatabaseError>;
}
