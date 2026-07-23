import { eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';

import db from '@infrastructure/database';
import { usersTable } from '@infrastructure/database/schema';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';
import { NewUser, User } from '@modules/user/domain/user.types';

@injectable()
export class UserRepository implements IUserRepository {
  async create(user: NewUser): Promise<User> {
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

  async findById(id: number) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    return user ?? null;
  }
}
