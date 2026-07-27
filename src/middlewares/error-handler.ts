import { Request, Response, NextFunction } from 'express';

import { AppError } from '@core/errors/app-error';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
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
