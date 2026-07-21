import { PasswordService } from './password.service';

describe('Password Service', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe('hash', () => {
    it('returns a hash password', async () => {
      const password = 'P4ssword';

      const hashedPassword = await passwordService.hash(password);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);
    });

    it('generates a different hash each time for the same password', async () => {
      const password = 'P4ssword';

      const hash1 = await passwordService.hash(password);
      const hash2 = await passwordService.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });
});
