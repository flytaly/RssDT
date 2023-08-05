import { db } from '#root/db/db.js';
import { items, userFeeds, UserFeedWithOpts, ItemWithEnclosures } from '#root/db/schema.js';
import { DigestSchedule } from '#root/types/enums.js';
import { sql } from 'drizzle-orm';
import PgTsquery from 'pg-tsquery';
import { logger } from '#root/logger.js';

const pgTsquery = PgTsquery();

export async function userFeedsWithDigests(feedId: number) {
  const whereQuery = sql`${userFeeds.feedId} = ${feedId} AND ${userFeeds.activated} = true`;
  whereQuery.append(sql` AND NOT ${userFeeds.schedule} = ${DigestSchedule.disable}`);
  return db.query.userFeeds.findMany({
    where: whereQuery,
    with: {
      user: {
        with: {
          options: true,
        },
      },
    },
  }) as Promise<UserFeedWithOpts[]>;
}

type GetItemsOptions = {
  limit?: number;
  usePubDate?: boolean;
  filter?: string | null;
};

export async function getItemsNewerThan(
  feedId: number,
  time: Date,
  { limit, usePubDate = false, filter }: GetItemsOptions,
) {
  logger.info({ feedId, time: time, limit, usePubDate });

  const where = sql`${items.feedId} = ${feedId} AND ${items.createdAt} > ${time}`;

  if (usePubDate) {
    where.append(sql` AND ${items.pubdate} > ${time}`);
  }

  if (filter) {
    const query = pgTsquery(filter);
    where.append(sql` AND to_tsvector(${items.title}) @@ to_tsquery(${query})`);
  }

  const itemsWithEnc = (await db.query.items.findMany({
    with: { enclosures: true },
    orderBy: sql`${items.createdAt} desc, ${items.pubdate} desc`,
    where,
    limit,
  })) as ItemWithEnclosures[];

  return itemsWithEnc;
}
