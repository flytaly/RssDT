import { getConnection } from 'typeorm';
// eslint-disable-next-line import/extensions
import { UserFeed } from '#entities';

export function getUserFeeds(userId: number) {
  return getConnection()
    .getRepository(UserFeed)
    .createQueryBuilder('uf')
    .where({ userId })
    .innerJoinAndSelect('uf.feed', 'f', 'f.id = uf.feedId')
    .orderBy('f.lastPubdate', 'DESC')
    .getMany();
}
