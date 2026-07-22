import { Request } from 'express';

import { usersTable } from '@/db/schema/user.schema';

import { AuthUser } from '../auth/auth.types';

export interface IGetUserAuthInfoRequest extends Request {
  user: AuthUser;
}

export type NewUser = typeof usersTable.$inferInsert;

export type User = typeof usersTable.$inferSelect;
