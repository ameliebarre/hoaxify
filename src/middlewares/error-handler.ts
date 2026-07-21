import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof Error) {
    return res.status(500).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    message: 'Unknown error',
  });
}
