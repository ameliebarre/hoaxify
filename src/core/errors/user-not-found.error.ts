import { AppError } from './app-error';

export class UserNotFoundError extends AppError {
  constructor() {
    super('Unauthorized', 401);
  }
}
