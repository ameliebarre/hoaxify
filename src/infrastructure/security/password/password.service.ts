import bcrypt from 'bcrypt';
import { ResultAsync } from 'neverthrow';
import { injectable } from 'tsyringe';

import { PasswordError } from '@infrastructure/security/password/password.error';

import type { IPasswordService } from '@infrastructure/security/password/password.service.interface';

const SALT_ROUNDS = 12;

const DUMMY_PASSWORD_HASH = bcrypt.hashSync(
  'dummy-password-for-timing-safety',
  SALT_ROUNDS,
);

@injectable()
export class PasswordService implements IPasswordService {
  hash(password: string): ResultAsync<string, PasswordError> {
    return ResultAsync.fromPromise(
      bcrypt.hash(password, SALT_ROUNDS),
      (error) => ({
        type: 'PasswordHashError',
        message: String(error),
      }),
    );
  }

  compare(
    password: string,
    hashedPassword: string,
  ): ResultAsync<boolean, PasswordError> {
    return ResultAsync.fromPromise(
      bcrypt.compare(password, hashedPassword),
      (error) => ({
        type: 'PasswordCompareError',
        message: String(error),
      }),
    );
  }

  compareOrDummy(
    password: string,
    hashedPassword: string | null,
  ): ResultAsync<boolean, PasswordError> {
    return this.compare(password, hashedPassword ?? DUMMY_PASSWORD_HASH).map(
      (isValid) => hashedPassword !== null && isValid,
    );
  }
}
