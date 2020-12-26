import { getConnection } from 'typeorm';
import { Feed } from '../../entities/Feed';
import { UserFeed } from '../../entities/UserFeed';
import { ArgumentError } from './ArgumentError';

export const activateUserFeed = async (userFeedId: number) => {
    const updResult = await getConnection()
        .createQueryBuilder()
        .update(UserFeed)
        .set({ activated: true })
        .where({ id: userFeedId })
        .returning('*')
        .execute();
    if (!updResult.raw.length) return { errors: new ArgumentError('', "couldn't activate feed") };
    const userFeed = updResult.raw[0] as UserFeed;
    userFeed.activated = true;
    const feed = await getConnection()
        .createQueryBuilder()
        .update(Feed)
        .set({ activated: true })
        .where({ id: userFeed.feedId })
        .returning('*')
        .execute();
    userFeed.feed = feed.raw[0] as Feed;
    return userFeed;
};
