import { integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { usersTable } from '@infrastructure/database/schema/user.schema';

export const refreshTokensTable = pgTable('refresh_tokens', {
  id: uuid().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  familyId: uuid().notNull(),
  revokedAt: timestamp('revoked_at'),
  replacedByTokenId: uuid('replaced_by_token_id'),
  expiresAt: timestamp('expires_at').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});