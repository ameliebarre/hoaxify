import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';

import { GetCurrentUserUseCase } from '@modules/auth/use-cases/get-current-user.use-case';
import { LoginUserUseCase } from '@modules/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '@modules/auth/use-cases/register-user.use-case';

@injectable()
export class AuthController {
  constructor(
    @inject(RegisterUserUseCase)
    private readonly registerUserUseCase: RegisterUserUseCase,

    @inject(LoginUserUseCase)
    private readonly loginUserUseCase: LoginUserUseCase,

    @inject(GetCurrentUserUseCase)
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
