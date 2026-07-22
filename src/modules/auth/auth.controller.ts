import { Request, Response } from 'express';
import { injectable } from 'tsyringe';

import { GetCurrentUserUseCase } from './use-cases/get-current-user';
import { LoginUserUseCase } from './use-cases/login-user';
import { RegisterUserUseCase } from './use-cases/register-user';

@injectable()
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {}

  async signup(req: Request, res: Response) {
    await this.registerUserUseCase.execute(req.body);
    return res.status(201).send({ message: 'User successfully created' });
  }

  async login(req: Request, res: Response) {
    const result = await this.loginUserUseCase.execute(req.body);

    return res.status(200).send(result);
  }

  async me(req: Request, res: Response) {
    const user = await this.getCurrentUserUseCase.execute(req.user!.userId);

    return res.status(200).json(user);
  }
}
