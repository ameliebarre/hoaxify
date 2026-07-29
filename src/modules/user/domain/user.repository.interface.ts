import { ResultAsync } from 'neverthrow';

import { DatabaseError } from '@/core/errors/domain/database.error';

import { NewUser, User } from './user.types';

export interface IUserRepository {
  create(user: NewUser): ResultAsync<User, DatabaseError>;
  findByEmail(email: string): ResultAsync<User | null, DatabaseError>;
  findById(id: number): ResultAsync<User | null, DatabaseError>;
  findByUsername(username: string): ResultAsync<User | null, DatabaseError>;
}
