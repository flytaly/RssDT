import './src/dotenv';

import { type Config } from 'drizzle-kit';
import { getPGCredentials } from './src/pg-connection.js';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: getPGCredentials(),
} as Config;
