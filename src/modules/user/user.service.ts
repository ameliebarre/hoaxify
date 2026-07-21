import { injectable, inject } from 'tsyringe';

import { TOKENS } from '@/shared';

import { IUserRepository } from './user.repository.interface';
import { IUserService } from './user.service.interface';
import { User } from './user.types';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async getByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async createUser(data: User) {
    return this.userRepository.create(data);
  }
}
