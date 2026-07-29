import { ResultAsync } from 'neverthrow';

import { JwtError } from './jwt.error';

export interface IJwtService {
  sign(payload: { userId: number }): ResultAsync<string, JwtError>;
  verify(token: string): ResultAsync<
    {
      userId: number;
    },
    JwtError
  >;
}
