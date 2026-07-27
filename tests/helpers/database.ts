import db from '@infrastructure/database';
import { usersTable } from '@infrastructure/database/schema';

export async function cleanDatabase() {
  await db.delete(usersTable);
}
