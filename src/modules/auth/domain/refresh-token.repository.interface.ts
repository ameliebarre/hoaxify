import { ResultAsync } from 'neverthrow';

import { DatabaseError } from '@core/errors/domain/database.error';
import {
  NewRefreshToken,
  RefreshTokenRecord,
} from '@modules/auth/domain/refresh-token.types';

export interface RotateParams {
  oldId: string;
  newId: string;
  userId: number;
  expiresAt: Date;
}

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
  // Atomically claims `oldId` (only if it isn't already revoked) and, only
  // if the claim succeeds, inserts the new token in the same family within
  // one transaction. Returns null if the claim failed (already rotated,
  // reused, or unknown) — the caller must not assume the old token still
  // exists in that case, only that nothing was written.
  rotate(
    params: RotateParams,
  ): ResultAsync<RefreshTokenRecord | null, DatabaseError>;
}
