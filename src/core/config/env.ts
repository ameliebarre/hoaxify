function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const env = {
  POSTGRES_USER: getEnv('POSTGRES_USER'),
  POSTGRES_DB: getEnv('POSTGRES_DB'),
  POSTGRES_PASSWORD: getEnv('POSTGRES_PASSWORD'),
  DATABASE_URL: getEnv('DATABASE_URL'),
};
