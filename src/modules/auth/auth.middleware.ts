import { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '@/errors/unauthorized-error';

import { ITokenService } from '../security/domain/token.service.interface';

export function authenticateMiddleware(tokenService: ITokenService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedError();
    }

    const [, token] = authorization.split(' ');

    const payload = tokenService.verifyAccessToken(token);

    req.user = payload;

    next();
  };
}
