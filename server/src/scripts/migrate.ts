import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

import '#root/dotenv.js';
import { getPGCredentials } from '#root/pg-connection.js';

console.log('Migration: ', process.env.NODE_ENV || '');

const pool = new pg.Pool(getPGCredentials());

const db = drizzle(pool);

async function run() {
  await migrate(db, { migrationsFolder: './drizzle' });
}

run();
