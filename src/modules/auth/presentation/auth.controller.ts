import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';

import { cookieConfig } from '@core/config/cookies';
import { mapErrorToHttp } from '@core/errors/http/error-response.mapper';
import { GetCurrentUserUseCase } from '@modules/auth/use-cases/get-current-user.use-case';
import { LoginUserUseCase } from '@modules/auth/use-cases/login-user.use-case';
import { LogoutUseCase } from '@modules/auth/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '@modules/auth/use-cases/refresh-token.use-case';
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

    @inject(RefreshTokenUseCase)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,

    @inject(LogoutUseCase)
    private readonly logoutUseCase: LogoutUseCase,
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
      ({ user, accessToken, refreshToken }) => {
        return res
          .cookie('refreshToken', refreshToken, cookieConfig.refreshToken)
          .status(200)
          .json({
            user,
            accessToken,
          });
      },
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

  refresh = async (req: Request, res: Response): Promise<Response> => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: {
          type: 'Unauthorized',
          message: 'Refresh token is missing',
        },
      });
    }

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    return result.match(
      ({ accessToken, refreshToken: newRefreshToken }) =>
        res
          .cookie('refreshToken', newRefreshToken, cookieConfig.refreshToken)
          .status(200)
          .json({
            accessToken,
          }),

      (error) => {
        const response = mapErrorToHttp(error);

        return res.status(response.status).json(response.body);
      },
    );
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    await this.logoutUseCase.execute(req.cookies.refreshToken);

    return res.clearCookie('refreshToken', cookieConfig.refreshToken).status(204).send();
  };
}
