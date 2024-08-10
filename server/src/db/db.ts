import '#root/dotenv.js';
import { IS_DEV } from '#root/constants.js';
import { Logger } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import { getPGCredentials } from '#root/pg-connection.js';

const pool = new Pool(getPGCredentials());

class QLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    console.log(query, params);
  }
}

const logger = new QLogger();

export const db = drizzle(pool, { schema, logger: IS_DEV ? logger : undefined });

export type DB = typeof db;
