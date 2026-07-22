import { Request, Response } from 'express';
import { injectable } from 'tsyringe';

import { LoginUserUseCase } from './use-cases/login-user';
import { RegisterUserUseCase } from './use-cases/register-user';

@injectable()
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  async signup(req: Request, res: Response) {
    await this.registerUserUseCase.execute(req.body);
    return res.status(201).send({ message: 'User successfully created' });
  }

  async login(req: Request, res: Response) {
    const result = await this.loginUserUseCase.execute(req.body);

    return res.status(200).send(result);
  }
}
