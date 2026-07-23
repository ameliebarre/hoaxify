import { JwtService } from '@infrastructure/security/infrastructure/jwt.service';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService();
  });

  it('generates an access token', () => {
    const token = jwtService.generateAccessToken({ userId: 1 });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('verifies a valid token', () => {
    const token = jwtService.generateAccessToken({ userId: 1 });

    const payload = jwtService.verifyAccessToken(token);

    expect(payload).toMatchObject({
      userId: 1,
    });
  });

  it('throws when token is invalid', () => {
    expect(() => jwtService.verifyAccessToken('invalid-token')).toThrow();
  });
});
