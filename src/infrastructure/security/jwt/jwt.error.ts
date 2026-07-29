export interface JwtSignError {
  type: 'JwtSignError';
  message: string;
}

export interface JwtVerifyError {
  type: 'JwtVerifyError';
  message: string;
}

export type JwtError = JwtSignError | JwtVerifyError;
