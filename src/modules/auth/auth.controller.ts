import { Request, Response } from 'express';
import { injectable } from 'tsyringe';

import { RegisterUserUseCase } from './use-cases/register-user';

@injectable()
export class AuthController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  async signup(req: Request, res: Response) {
    await this.registerUserUseCase.execute(req.body);
    return res.status(201).send({ message: 'User successfully created' });
  }
}
