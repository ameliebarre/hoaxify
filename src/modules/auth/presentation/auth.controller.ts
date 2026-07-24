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
    const result = await this.registerUserUseCase.execute(req.body);

    return result.match(
      () => res.status(201).json({ message: 'User successfully created' }),
      (error) => res.status(error.statusCode).json({ message: error.message }),
    );
  }

  async login(req: Request, res: Response) {
    const result = await this.loginUserUseCase.execute(req.body);

    return result.match(
      (data) => res.status(200).json(data),
      (error) => res.status(error.statusCode).json({ message: error.message }),
    );
  }

  async me(req: Request, res: Response) {
    const result = await this.getCurrentUserUseCase.execute(req.user!.userId);

    return result.match(
      (user) => res.status(200).json(user),
      (error) => res.status(error.statusCode).json({ message: error.message }),
    );
  }
}
