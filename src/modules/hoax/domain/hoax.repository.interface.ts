import { DatabaseError } from '@core/errors/domain/database.error';
import { ResultAsync } from 'neverthrow';

import { Hoax, NewHoax } from '@modules/hoax/domain/hoax.types';

export interface IHoaxRepository {
  create(hoax: NewHoax): ResultAsync<Hoax, DatabaseError>;
}
