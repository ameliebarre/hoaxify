import { DatabaseError } from '@core/errors/domain/database.error';
import { UserError } from '@modules/user/domain/errors/user.error';

export type GetCurrentUserError = UserError | DatabaseError;
