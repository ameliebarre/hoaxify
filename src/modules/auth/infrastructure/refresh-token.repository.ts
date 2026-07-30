import { and, eq, isNull } from 'drizzle-orm';
import { ResultAsync } from 'neverthrow';
import { injectable } from 'tsyringe';

import { DatabaseError } from '@core/errors/domain/database.error';
import { fromDatabasePromise } from '@core/errors/infrastructure/result-async';
import db from '@infrastructure/database';
import { refreshTokensTable } from '@infrastructure/database/schema';
import {
  IRefreshTokenRepository,
  RotateParams,
} from '@modules/auth/domain/refresh-token.repository.interface';
import {
  NewRefreshToken,
  RefreshTokenRecord,
} from '@modules/auth/domain/refresh-token.types';

@injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  create(
    token: NewRefreshToken,
  ): ResultAsync<RefreshTokenRecord, DatabaseError> {
    return fromDatabasePromise(
      db
        .insert(refreshTokensTable)
        .values(token)
        .returning()
        .then((rows) => rows[0]),
    );
  }

  findById(
    id: string,
  ): ResultAsync<RefreshTokenRecord | null, DatabaseError> {
    return fromDatabasePromise(
      db
        .select()
        .from(refreshTokensTable)
        .where(eq(refreshTokensTable.id, id))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    );
  }

  revoke(
    id: string,
    replacedByTokenId?: string,
  ): ResultAsync<void, DatabaseError> {
    return fromDatabasePromise(
      db
        .update(refreshTokensTable)
        .set({
          revokedAt: new Date(),
          replacedByTokenId: replacedByTokenId ?? null,
        })
        .where(eq(refreshTokensTable.id, id))
        .then(() => undefined),
    );
  }

  revokeFamily(familyId: string): ResultAsync<void, DatabaseError> {
    return fromDatabasePromise(
      db
        .update(refreshTokensTable)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokensTable.familyId, familyId))
        .then(() => undefined),
    );
  }

  rotate(
    params: RotateParams,
  ): ResultAsync<RefreshTokenRecord | null, DatabaseError> {
    return fromDatabasePromise(
      db.transaction(async (tx) => {
        const [claimedOld] = await tx
          .update(refreshTokensTable)
          .set({ revokedAt: new Date(), replacedByTokenId: params.newId })
          .where(
            and(
              eq(refreshTokensTable.id, params.oldId),
              isNull(refreshTokensTable.revokedAt),
            ),
          )
          .returning();

        if (!claimedOld) {
          return null;
        }

        const [created] = await tx
          .insert(refreshTokensTable)
          .values({
            id: params.newId,
            userId: params.userId,
            familyId: claimedOld.familyId,
            expiresAt: params.expiresAt,
          })
          .returning();

        return created;
      }),
    );
  }
}