import { AppError } from '../domain/app.error';

export interface HttpErrorResponse {
  status: number;
  body: {
    error: {
      type: AppError['type'];
      message: string;
    };
  };
}

export function httpError(status: number, error: AppError): HttpErrorResponse {
  return {
    status,
    body: {
      error: {
        type: error.type,
        message: error.message,
      },
    },
  };
}
