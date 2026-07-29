import { AppError } from '@core/errors/domain/app.error';
import { httpError } from '@core/errors/http/http-error';

export function mapErrorToHttp(error: AppError) {
  switch (error.type) {
    // 401 Unauthorized
    case 'Unauthorized':
    case 'InvalidCredentials':
    case 'UserNotFound':
    case 'JwtVerifyError':
    case 'InvalidRefreshToken':
      return httpError(401, error);

    // 409 Conflict
    case 'EmailAlreadyExists':
    case 'UsernameAlreadyExists':
      return httpError(409, error);

    // 500 Internal Server Error
    case 'DatabaseError':
    case 'PasswordHashError':
    case 'PasswordCompareError':
    case 'JwtSignError':
      return httpError(500, error);

    default:
      return {
        status: 500,
        body: {
          error: {
            type: 'InternalServerError',
            message: 'Unexpected error',
          },
        },
      };
  }
}
