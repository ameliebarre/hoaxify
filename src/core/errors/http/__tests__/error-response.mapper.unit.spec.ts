import { mapErrorToHttp } from '@core/errors/http/error-response.mapper';

describe('mapErrorToHttp', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe.each([
    ['Unauthorized', 401],
    ['InvalidCredentials', 401],
    ['UserNotFound', 401],
    ['JwtVerifyError', 401],
    ['InvalidRefreshToken', 401],
    ['EmailAlreadyExists', 409],
    ['UsernameAlreadyExists', 409],
  ])(
    'Given a client-facing error of type %s',
    (type, expectedStatus: number) => {
      describe('When mapping it to an HTTP response', () => {
        it(`Then it should return status ${expectedStatus} and preserve the original message`, () => {
          const error = { type, message: 'a safe, specific message' } as never;

          const response = mapErrorToHttp(error);

          expect(response.status).toBe(expectedStatus);
          expect(response.body.error.type).toBe(type);
          expect(response.body.error.message).toBe('a safe, specific message');
        });
      });
    },
  );

  describe.each([
    'DatabaseError',
    'PasswordHashError',
    'PasswordCompareError',
    'JwtSignError',
  ])('Given an internal error of type %s', (type) => {
    describe('When mapping it to an HTTP response', () => {
      it('Then it should return status 500 without leaking the internal message', () => {
        const error = {
          type,
          message: 'relation "users" violates constraint fk_1234',
        } as never;

        const response = mapErrorToHttp(error);

        expect(response.status).toBe(500);
        expect(response.body.error.type).toBe(type);
        expect(response.body.error.message).not.toContain('fk_1234');
        expect(response.body.error.message).not.toContain('relation');
      });

      it('Then it should log the original error server-side', () => {
        const error = { type, message: 'internal detail' } as never;

        mapErrorToHttp(error);

        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Given an error type outside the known union', () => {
    describe('When mapping it to an HTTP response', () => {
      it('Then it should fall back to a generic 500 response', () => {
        const error = { type: 'SomeUnmappedError', message: 'oops' } as never;

        const response = mapErrorToHttp(error);

        expect(response.status).toBe(500);
        expect(response.body.error.type).toBe('InternalServerError');
        expect(response.body.error.message).not.toBe('oops');
      });
    });
  });
});