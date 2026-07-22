import { User } from './user.types';

export function toPublicUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}
