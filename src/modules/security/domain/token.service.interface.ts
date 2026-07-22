export interface ITokenService {
  generateAccessToken(payload: object): string;
  verifyAccessToken(token: string): object;
}
