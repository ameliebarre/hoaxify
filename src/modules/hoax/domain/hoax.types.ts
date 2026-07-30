import { hoaxesTable } from '@infrastructure/database/schema/hoax.schema';

export type NewHoax = typeof hoaxesTable.$inferInsert;

export type Hoax = typeof hoaxesTable.$inferSelect;