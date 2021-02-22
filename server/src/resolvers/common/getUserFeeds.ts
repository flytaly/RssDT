import { getConnection } from 'typeorm';
import { UserFeed } from '../../entities/UserFeed';

export const getUserFeeds = (userId: number) =>
  getConnection()
    .getRepository(UserFeed)
    .createQueryBuilder('uf')
    .where({ userId })
    .innerJoinAndSelect('uf.feed', 'f', 'f.id = uf.feedId')
    .orderBy('f.lastPubdate', 'DESC')
    .getMany();
