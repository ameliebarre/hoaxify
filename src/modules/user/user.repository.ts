import { eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';

import db from '@/db';
import { usersTable } from '@/db/schema';

import { IUserRepository } from './user.repository.interface';
import { User } from './user.types';

@injectable()
export class UserRepository implements IUserRepository {
  async create(user: User) {
    const [createdUser] = await db.insert(usersTable).values(user).returning();
    return createdUser;
  }

  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return user ?? null;
  }
}
