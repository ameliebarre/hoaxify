import { hoaxesTable } from '@infrastructure/database/schema/hoax.schema';

export type NewHoax = typeof hoaxesTable.$inferInsert;

export type Hoax = typeof hoaxesTable.$inferSelect;

export interface HoaxWithAuthor {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    id: number;
    username: string;
  };
}