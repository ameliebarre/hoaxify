import bcrypt from 'bcrypt';
import { injectable } from 'tsyringe';

import { IPasswordService } from './password.service.interface';

const SALT_ROUNDS = 12;

@injectable()
export class PasswordService implements IPasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }
}
