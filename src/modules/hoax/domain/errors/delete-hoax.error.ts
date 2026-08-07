import { DatabaseError } from '@core/errors/domain/database.error';
import { HoaxError } from '@modules/hoax/domain/errors/hoax.error';

export type DeleteHoaxError = HoaxError | DatabaseError;
