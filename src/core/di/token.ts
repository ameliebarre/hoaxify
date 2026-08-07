export const TOKENS = {
  PasswordService: Symbol.for('PasswordService'),
  UserRepository: Symbol.for('UserRepository'),
  JwtService: Symbol.for('JwtService'),
  RefreshTokenRepository: Symbol.for('RefreshTokenRepository'),
  HoaxRepository: Symbol.for('HoaxRepository'),
} as const;
