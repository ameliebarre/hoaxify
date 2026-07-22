export interface ITokenService {
  generateAccessToken(payload: { userId: number }): string;
  verifyAccessToken(token: string): {
    userId: number;
  };
}
