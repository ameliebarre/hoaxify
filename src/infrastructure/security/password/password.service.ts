import bcrypt from 'bcrypt';
import { ResultAsync } from 'neverthrow';
import { injectable } from 'tsyringe';

import { PasswordError } from '@infrastructure/security/password/password.error';

import type { IPasswordService } from '@infrastructure/security/password/password.service.interface';

const SALT_ROUNDS = 12;

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
}
