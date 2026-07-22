import { JwtPayload } from 'jsonwebtoken';

export interface AccessTokenPayload extends JwtPayload {
  userId: number;
}
