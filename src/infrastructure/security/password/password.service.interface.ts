import { ResultAsync } from 'neverthrow';

import { PasswordError } from './password.error';

export interface IPasswordService {
  hash(password: string): ResultAsync<string, PasswordError>;
  compare(
    password: string,
    hashedPassword: string,
  ): ResultAsync<boolean, PasswordError>;
  // Runs a real bcrypt comparison even when hashedPassword is null (dummy hash), to keep timing constant and prevent user enumeration.
  compareOrDummy(
    password: string,
    hashedPassword: string | null,
  ): ResultAsync<boolean, PasswordError>;
}
