import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { usersTable } from '@infrastructure/database/schema/user.schema';

export const hoaxesTable = pgTable('hoaxes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  content: varchar({ length: 5000 }).notNull(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});