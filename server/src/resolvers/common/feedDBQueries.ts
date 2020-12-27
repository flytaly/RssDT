import { getConnection } from 'typeorm';
import { Feed } from '../../entities/Feed';
import { UserFeed } from '../../entities/UserFeed';

export const activateUserFeed = async (userFeedId: number, userId?: number) => {
    const qb = getConnection().createQueryBuilder();
    const updResult = await qb
        .update(UserFeed)
        .set({ activated: true })
        .where({ id: userFeedId, ...(userId ? { userId } : {}) })
        .returning('*')
        .execute();
    if (!updResult.raw.length) return { errors: [{ message: "couldn't activate feed" }] };
    const userFeed = updResult.raw[0] as UserFeed;
    userFeed.activated = true;
    const feed = await qb
        .update(Feed)
        .set({ activated: true })
        .where({ id: userFeed.feedId })
        .returning('*')
        .execute();
    userFeed.feed = feed.raw[0] as Feed;
    return { userFeed };
};
