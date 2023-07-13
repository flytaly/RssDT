import { Logger } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

class QLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    console.log(query, params);
  }
}

const logger = new QLogger();

export const db = drizzle(pool, { schema, logger });
