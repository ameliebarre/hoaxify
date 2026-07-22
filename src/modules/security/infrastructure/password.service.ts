import bcrypt from 'bcrypt';
import { injectable } from 'tsyringe';

import { IPasswordService } from '../domain/password.service.interface';

const SALT_ROUNDS = 12;

@injectable()
export class PasswordService implements IPasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
