import { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '@core/errors/unauthorized-error';
import { ITokenService } from '@infrastructure/security/domain/token.service.interface';

export function authenticateMiddleware(tokenService: ITokenService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedError();
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError();
    }

    const payload = tokenService.verifyAccessToken(token);

    req.user = payload;

    next();
  };
}
