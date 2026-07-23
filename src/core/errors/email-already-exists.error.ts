import { AppError } from './app-error';

export class EmailAlreadyExistsError extends AppError {
  constructor() {
    super('Email already exists', 409);
  }
}
