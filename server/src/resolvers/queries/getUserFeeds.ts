import { getConnection } from 'typeorm';
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
