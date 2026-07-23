import { Request, Response, NextFunction } from 'express';

import { EmailAlreadyExistsError } from '@core/errors/email-already-exists.error';
import { UnauthorizedError } from '@core/errors/unauthorized-error';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof EmailAlreadyExistsError) {
    return res.status(409).json({
      message: err.message,
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      message: err.message,
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    message: 'Unknown error',
  });
}
