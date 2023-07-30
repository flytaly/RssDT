import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import '#root/dotenv.js';

console.log('Migration: ', process.env.NODE_ENV || '');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function run() {
  await migrate(db, { migrationsFolder: './drizzle' });
}

run();
