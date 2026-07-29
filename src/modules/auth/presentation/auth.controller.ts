import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';

import { mapErrorToHttp } from '@core/errors/http/error-response.mapper';
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

  signup = async (req: Request, res: Response): Promise<Response> => {
    const data = req.body;
    const result = await this.registerUserUseCase.execute(data);

    return result.match(
      (user) => res.status(201).json(user),

      (error) => {
        const response = mapErrorToHttp(error);

        return res.status(response.status).json(response.body);
      },
    );
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.loginUserUseCase.execute(req.body);

    return result.match(
      (user) => res.status(200).json(user),

      (error) => {
        const response = mapErrorToHttp(error);

        return res.status(response.status).json(response.body);
      },
    );
  };

  me = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.getCurrentUserUseCase.execute(req.user!.userId);

    return result.match(
      (user) => res.status(200).json(user),

      (error) => {
        const response = mapErrorToHttp(error);

        return res.status(response.status).json(response.body);
      },
    );
  };
}
