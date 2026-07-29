import { ResultAsync } from 'neverthrow';

import { PasswordError } from './password.error';

export interface IPasswordService {
  hash(password: string): ResultAsync<string, PasswordError>;
  compare(
    password: string,
    hashedPassword: string,
  ): ResultAsync<boolean, PasswordError>;
}
