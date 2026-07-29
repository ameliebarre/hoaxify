import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

process.on('unhandledRejection', (reason) => {
  console.error('❌ CRASH ASYNCHRONE DÉTECTÉ :', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ CRASH SYNCHRONE DÉTECTÉ :', error);
  process.exit(1);
});

import app from '@/app';

import env from '@core/config/env';

const PORT = env.PORT ?? 8000;

app.listen(PORT, () => {
  console.log(`🚀 [Server]: Ready and listening on port ${PORT}`);
});
