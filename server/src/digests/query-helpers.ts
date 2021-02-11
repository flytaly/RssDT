import { getConnection, MoreThan, Not } from 'typeorm';
import PgTsquery from 'pg-tsquery';
import { Item } from '../entities/Item';
import { UserFeed } from '../entities/UserFeed';
import { DigestSchedule } from '../types/enums';

const pgTsquery = PgTsquery();

export async function userFeedsWithDigests(feedId: number) {
  return UserFeed.find({
    where: { feedId, activated: true, schedule: Not(DigestSchedule.disable) },
    loadEagerRelations: true,
    relations: ['user'],
  });
}

type GetItemsOptions = {
  limit?: number;
  usePubDate?: boolean;
  filter?: string;
};

export async function getItemsNewerThan(
  feedId: number,
  time: Date | string,
  { limit, usePubDate = false, filter }: GetItemsOptions,
) {
  let dbQuery = getConnection() //
    .getRepository(Item)
    .createQueryBuilder('item')
    .where('item.feedId = :feedId', { feedId })
    .andWhere('item.createdAt > :time', { time })
    .leftJoinAndSelect('item.enclosures', 'enclosure')
    .orderBy('item.createdAt', 'DESC')
    .addOrderBy('item.pubdate', 'DESC')
    .take(limit);

  if (usePubDate) {
    dbQuery = dbQuery.andWhere('item.pubdate > :time', { time });
  }

  if (filter) {
    dbQuery = dbQuery.andWhere('to_tsvector(item.title) @@ to_tsquery(:query)', {
      query: pgTsquery(filter),
    });
  }

  return dbQuery.getMany();
}
