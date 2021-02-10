import { MoreThan, Not } from 'typeorm';
import { Item } from '../entities/Item';
import { UserFeed } from '../entities/UserFeed';
import { DigestSchedule } from '../types/enums';

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
};

export async function getItemsNewerThan(
  feedId: number,
  time: Date | string,
  { limit, usePubDate = false }: GetItemsOptions,
) {
  return Item.find({
    where: {
      feedId,
      createdAt: MoreThan(time),
      ...(usePubDate ? { pubdate: MoreThan(time) } : {}),
    },
    order: { pubdate: 'DESC' },
    take: limit,
  });
}
