import { DatabaseError } from '@core/errors/domain/database.error';
import { count, desc, eq } from 'drizzle-orm';
import { ResultAsync } from 'neverthrow';
import { injectable } from 'tsyringe';

import { fromDatabasePromise } from '@core/errors/infrastructure/result-async';
import db from '@infrastructure/database';
import { hoaxesTable, usersTable } from '@infrastructure/database/schema';
import {
  FindManyHoaxesParams,
  FindManyHoaxesResult,
  IHoaxRepository,
} from '@modules/hoax/domain/hoax.repository.interface';
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

  findMany(
    params: FindManyHoaxesParams,
  ): ResultAsync<FindManyHoaxesResult, DatabaseError> {
    const whereClause =
      params.userId !== undefined
        ? eq(hoaxesTable.userId, params.userId)
        : undefined;

    return fromDatabasePromise(
      Promise.all([
        db
          .select({
            id: hoaxesTable.id,
            content: hoaxesTable.content,
            createdAt: hoaxesTable.createdAt,
            user: {
              id: usersTable.id,
              username: usersTable.username,
            },
          })
          .from(hoaxesTable)
          .innerJoin(usersTable, eq(hoaxesTable.userId, usersTable.id))
          .where(whereClause)
          .orderBy(desc(hoaxesTable.createdAt))
          .limit(params.size)
          .offset(params.page * params.size),
        db
          .select({ value: count() })
          .from(hoaxesTable)
          .where(whereClause)
          .then((rows) => rows[0].value),
      ]).then(([hoaxes, totalCount]) => ({ hoaxes, totalCount })),
    );
  }
}
