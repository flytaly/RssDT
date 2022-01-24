import { getConnection } from 'typeorm';
// eslint-disable-next-line import/extensions
import { Feed, User, UserFeed } from '#entities';

export async function activateUserFeed(
  userFeedId: number,
  userId: number | null,
  onSuccess?: (uf: UserFeed, feed: Feed) => Promise<unknown>,
) {
  const qb = getConnection().createQueryBuilder();

  // Update UserFeed
  const updResult = await qb
    .update(UserFeed)
    .set({ activated: true })
    .where({ id: userFeedId, ...(userId ? { userId } : {}) })
    .returning('*')
    .execute();
  if (!updResult.raw.length) return { errors: [{ message: "couldn't activate feed" }] };
  const userFeed = updResult.raw[0] as UserFeed;
  userFeed.activated = true;

  // Update Feed
  const feedUpdResult = await qb
    .update(Feed)
    .set({ activated: true })
    .where({ id: userFeed.feedId, activated: false })
    .returning('*')
    .execute();
  const feed = feedUpdResult.raw[0] as Feed;
  userFeed.feed = feed;

  // Update User
  await qb.update(User).set({ emailVerified: true }).where({ id: userFeed.userId }).execute();

  await onSuccess?.(userFeed, feed);

  return { userFeed };
}
