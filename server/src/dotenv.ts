import { config } from 'dotenv-safe';

config({
  // allowEmptyValues: process.env.NODE_ENV !== 'production',
  allowEmptyValues: true,
  ...(process.env.NODE_ENV === 'test' ? { path: '.env.testing' } : {}),
});
