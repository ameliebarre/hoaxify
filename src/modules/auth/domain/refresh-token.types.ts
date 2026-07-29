import { refreshTokensTable } from '@infrastructure/database/schema/refresh-token.schema';

export type NewRefreshToken = typeof refreshTokensTable.$inferInsert;

export type RefreshTokenRecord = typeof refreshTokensTable.$inferSelect;
