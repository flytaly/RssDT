/* eslint-disable no-await-in-loop */
import 'reflect-metadata';
import { sql, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import PQueue from 'p-queue';
import { Pool } from 'pg';

import '#root/dotenv.js';

import * as schema from '#root/db/schema.js';
import { updateFeedIcons } from '#root/utils/updateFeedIcons.js';
import { getPGCredentials } from '#root/pg-connection.js';

const pool = new Pool(getPGCredentials());

async function updateIcons() {
  const db = drizzle(pool, { schema });

  const limit = 10;
  const concurrency = 3;
  let offset = 0;

  const queue = new PQueue({ concurrency });
  const total = await db.select({ count: sql<number>`count(*)` }).from(schema.feeds);
  console.log('total :', total[0]?.count);

  async function getNextBatch(_offset: number) {
    return db.select().from(schema.feeds).limit(limit).offset(_offset);
  }

  let feedsBatch = await getNextBatch(offset);

  while (feedsBatch.length) {
    queue.addAll(
      feedsBatch.map((f) => () => {
        console.log(`update ${f.id}: ${f.link}`);
        return updateFeedIcons(f, db);
      }),
    );
    // TODO:
    // await queue.onSizeLessThan(3);
    await queue.onIdle();
    offset += limit;
    feedsBatch = await getNextBatch(offset);
  }
  await queue.onIdle();
  pool.end();
}

async function updateOneIcon(id: number) {
  const db = drizzle(pool, { schema });

  const selected = await db.select().from(schema.feeds).where(eq(schema.feeds.id, id)).execute();
  const f = selected[0];
  console.log(`update ${id}: ${f?.link}`);
  await updateFeedIcons(f, db);

  pool.end();
}

const id = process.argv.slice(2)[0];

if (id) updateOneIcon(+id);
else updateIcons();
