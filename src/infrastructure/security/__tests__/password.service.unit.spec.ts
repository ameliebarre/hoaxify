import { PasswordService } from '@/infrastructure/security/password/password.service';

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe('Given a valid plain password', () => {
    describe('When hashing the password', () => {
      it('Then it should return a hashed password', async () => {
        const password = 'P4ssword';

        const result = await passwordService.hash(password);

        expect(result.isOk()).toBe(true);

        const hashedPassword = result._unsafeUnwrap();

        expect(hashedPassword).toBeTruthy();
        expect(hashedPassword).not.toBe(password);
      });

      it('Then it should generate a different hash each time', async () => {
        const password = 'P4ssword';

        const firstHashResult = await passwordService.hash(password);
        const secondHashResult = await passwordService.hash(password);

        expect(firstHashResult.isOk()).toBe(true);
        expect(secondHashResult.isOk()).toBe(true);

        const firstHash = firstHashResult._unsafeUnwrap();
        const secondHash = secondHashResult._unsafeUnwrap();

        expect(firstHash).not.toBe(secondHash);
      });
    });
  });

  describe('Given a password has been hashed', () => {
    describe('When comparing the original password with the hash', () => {
      it('Then it should return true', async () => {
        const password = 'P4ssword';

        const hashResult = await passwordService.hash(password);

        expect(hashResult.isOk()).toBe(true);

        const hashedPassword = hashResult._unsafeUnwrap();

        const compareResult = await passwordService.compare(
          password,
          hashedPassword,
        );

        expect(compareResult.isOk()).toBe(true);

        expect(compareResult._unsafeUnwrap()).toBe(true);
      });
    });
  });

  describe('Given a password has been hashed', () => {
    describe('When comparing with an incorrect password', () => {
      it('Then it should return false', async () => {
        const hashResult = await passwordService.hash('P4ssword');

        expect(hashResult.isOk()).toBe(true);

        const hashedPassword = hashResult._unsafeUnwrap();

        const compareResult = await passwordService.compare(
          'WrongPassword',
          hashedPassword,
        );

        expect(compareResult.isOk()).toBe(true);

        expect(compareResult._unsafeUnwrap()).toBe(false);
      });
    });
  });
});
