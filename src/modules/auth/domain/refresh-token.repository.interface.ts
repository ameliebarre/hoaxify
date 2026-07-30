import { ResultAsync } from 'neverthrow';

import { DatabaseError } from '@core/errors/domain/database.error';
import {
  NewRefreshToken,
  RefreshTokenRecord,
} from '@modules/auth/domain/refresh-token.types';

export interface IRefreshTokenRepository {
  create(
    token: NewRefreshToken,
  ): ResultAsync<RefreshTokenRecord, DatabaseError>;
  findById(id: string): ResultAsync<RefreshTokenRecord | null, DatabaseError>;
  revoke(
    id: string,
    replacedByTokenId?: string,
  ): ResultAsync<void, DatabaseError>;
  revokeFamily(familyId: string): ResultAsync<void, DatabaseError>;
}
