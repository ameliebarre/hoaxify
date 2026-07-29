import { eq } from 'drizzle-orm';
import { ResultAsync } from 'neverthrow';
import { injectable } from 'tsyringe';

import { DatabaseError } from '@/core/errors/domain/database.error';

import { fromDatabasePromise } from '@core/errors/infrastructure/result-async';
import db from '@infrastructure/database';
import { usersTable } from '@infrastructure/database/schema';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';
import { NewUser, User } from '@modules/user/domain/user.types';

@injectable()
export class UserRepository implements IUserRepository {
  create(user: NewUser): ResultAsync<User, DatabaseError> {
    return fromDatabasePromise(
      db
        .insert(usersTable)
        .values(user)
        .returning()
        .then((rows) => rows[0]),
    );
  }

  findByEmail(email: string): ResultAsync<User | null, DatabaseError> {
    return fromDatabasePromise(
      db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    );
  }

  findById(id: number): ResultAsync<User | null, DatabaseError> {
    return fromDatabasePromise(
      db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    );
  }

  findByUsername(username: string): ResultAsync<User | null, DatabaseError> {
    return fromDatabasePromise(
      db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    );
  }
}
