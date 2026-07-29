import { NextFunction, Request, Response } from 'express';

import { mapErrorToHttp } from '@core/errors/http/error-response.mapper';

import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';

export function authenticateMiddleware(jwtService: IJwtService) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      const response = mapErrorToHttp({
        type: 'Unauthorized',
        message: 'Authentication required',
      });

      res.status(response.status).json(response.body);
      return;
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      const response = mapErrorToHttp({
        type: 'Unauthorized',
        message: 'Authentication required',
      });

      res.status(response.status).json(response.body);
      return;
    }

    const result = await jwtService.verifyAccessToken(token);

    result.match(
      (payload) => {
        req.user = payload;
        next();
      },
      (error) => {
        const response = mapErrorToHttp(error);

        res.status(response.status).json(response.body);
      },
    );
  };
}
