import { usersTable } from '@/db/schema/user.schema';

export type User = typeof usersTable.$inferInsert;
