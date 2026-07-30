import { DatabaseError } from '@core/errors/domain/database.error';
import { ResultAsync } from 'neverthrow';
import { injectable } from 'tsyringe';

import { fromDatabasePromise } from '@core/errors/infrastructure/result-async';
import db from '@infrastructure/database';
import { hoaxesTable } from '@infrastructure/database/schema';
import { IHoaxRepository } from '@modules/hoax/domain/hoax.repository.interface';
import { Hoax, NewHoax } from '@modules/hoax/domain/hoax.types';

@injectable()
export class HoaxRepository implements IHoaxRepository {
  create(hoax: NewHoax): ResultAsync<Hoax, DatabaseError> {
    return fromDatabasePromise(
      db
        .insert(hoaxesTable)
        .values(hoax)
        .returning()
        .then((rows) => rows[0]),
    );
  }
}
