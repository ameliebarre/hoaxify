import bcrypt from 'bcrypt';

import { PasswordService } from '@infrastructure/security/infrastructure/password.service';

describe('Password Service', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe('hash', () => {
    it('returns a hash password', async () => {
      const password = 'P4ssword';

      const hashedPassword = await passwordService.hash(password);

      expect(hashedPassword).toBeTruthy();
      expect(hashedPassword).not.toBe(password);
    });

    it('generates a different hash each time for the same password', async () => {
      const password = 'P4ssword';

      const hash1 = await passwordService.hash(password);
      const hash2 = await passwordService.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('returns true when password matches hashed password', async () => {
      const password = 'P4ssword';
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await passwordService.compare(password, hashedPassword);

      expect(result).toBe(true);
    });

    it('returns false when password does not match hashed password', async () => {
      const hashedPassword = await bcrypt.hash('P4ssword!', 10);

      const result = await passwordService.compare(
        'WrongPassword',
        hashedPassword,
      );

      expect(result).toBe(false);
    });
  });
});
