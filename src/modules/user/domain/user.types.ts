import { usersTable } from '@infrastructure/database/schema/user.schema';

export type NewUser = typeof usersTable.$inferInsert;

export type User = typeof usersTable.$inferSelect;
