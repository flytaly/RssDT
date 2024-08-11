import { UserFeed } from '#entities';
import { maxItemsPerUser, SUBSCRIPTION_CONFIRM_PREFIX } from '#root/constants.js';
import { Feed, userFeeds, users } from '#root/db/schema.js';
import { updateFeedData } from '#root/feed-watcher/watcher-utils.js';
import { auth } from '#root/middlewares/auth.js';
import { NormalizeAndValidateArgs } from '#root/middlewares/normalize-validate-args.js';
import { rateLimit } from '#root/middlewares/rate-limit.js';
import { DigestSchedule } from '#root/types/enums.js';
import { MyContext, Role } from '#root/types/index.js';
import { createUpdatedFeedLoader } from '#root/utils/createUpdatedFeedLoader.js';
import { and, eq, inArray } from 'drizzle-orm';
import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
  UseMiddleware,
} from 'type-graphql';
import { activateUserFeed } from './queries/activateUserFeed.js';
import { getUserAndCountFeeds } from './queries/countUserFeeds.js';
import { getUserFeeds } from './queries/getUserFeeds.js';
import { setLastViewedItemDate } from './queries/setLastViewedItemDate.js';
import { subscriptionVerifyEmail } from './resolver-types/confirmationMail.js';
import { ArgumentError } from './resolver-types/errors.js';
import {
  AddFeedEmailInput,
  AddFeedInput,
  UserFeedOptionsInput,
  UserInfoInput,
} from './resolver-types/inputs.js';
import { NewItemsPayload, PubSubTopics } from './resolver-types/pubSubTopics.js';
import {
  DeletedFeedResponse,
  DeleteFeedArgs,
  ImportFeedsArgs,
  ImportFeedsResponse,
  UserFeedNewItemsCountResponse,
  UserFeedResponse,
} from './resolver-types/userFeedTypes.js';
import { createUserFeed } from './userfeed-utils/createUserFeed.js';
import { launchFeedsImport } from './userfeed-utils/importFeeds.js';
import { ImportStatus, ImportStatusObject } from './userfeed-utils/ImportStatus.js';

const updatedFeedLoader = createUpdatedFeedLoader();

@Resolver(UserFeed)
export class UserFeedResolver {
  @UseMiddleware(auth())
  @Query(() => [UserFeed], { nullable: true })
  async myFeeds(@Ctx() { db, req }: MyContext) {
    return getUserFeeds(db, req.session.userId);
  }

  /**
   * Adds a feed digest to a user with the given email.
   * If the user does not exist, this mutation creates a new account without a password.
   * */
  @UseMiddleware(rateLimit(20, 60 * 10))
  @NormalizeAndValidateArgs([AddFeedEmailInput, 'input'], [UserInfoInput, 'userInfo'])
  @Mutation(() => UserFeedResponse, { nullable: true })
  async addFeedWithEmail(
    @Arg('input') { email, feedUrl: url }: AddFeedEmailInput,
    @Arg('userInfo', { nullable: true }) userInfo: UserInfoInput,
    @Arg('feedOpts', { nullable: true }) feedOpts: UserFeedOptionsInput,
    @Ctx() { db, redis }: MyContext,
  ) {
    feedOpts = feedOpts || {};
    if (!feedOpts.schedule || feedOpts.schedule === DigestSchedule.disable) {
      feedOpts.schedule = DigestSchedule.daily;
    }

    const userWithCount = await getUserAndCountFeeds(db, { email });
    if (userWithCount && userWithCount.countFeeds >= maxItemsPerUser) {
      return { errors: [new ArgumentError('feeds', 'Too many feeds')] };
    }

    const results = await createUserFeed(db, {
      url,
      email,
      user: userWithCount,
      userInfo,
      feedOpts,
    });
    if (results.errors) return { errors: results.errors };

    const { title } = results.feed!;
    const { id: userFeedId, schedule: digestType } = results.userFeed!;
    await subscriptionVerifyEmail(redis, { email, title: title || '', userFeedId, digestType });

    return { userFeed: { ...results.userFeed, feed: results.feed } };
  }

  /* Add feed to current user account */
  @UseMiddleware(auth(), rateLimit(60, 60))
  @NormalizeAndValidateArgs([AddFeedInput, 'input'])
  @Mutation(() => UserFeedResponse)
  async addFeedToCurrentUser(
    @Arg('input') { feedUrl: url }: AddFeedInput,
    @Arg('feedOpts', { nullable: true }) feedOpts: UserFeedOptionsInput,
    @Ctx() { req, redis, watcherQueue, db }: MyContext,
  ) {
    const { userId } = req.session;

    const userWithCount = await getUserAndCountFeeds(db, { userId });
    const { errors, userFeed, feed, user } = await createUserFeed(db, {
      url,
      email: null,
      user: userWithCount,
      feedOpts,
      onSuccess: (_, f: Feed) => watcherQueue.enqueueFeed(f),
    });
    if (errors) return { errors };

    if (userFeed?.schedule !== 'disable' && !user?.emailVerified) {
      await subscriptionVerifyEmail(redis, {
        email: user!.email,
        title: feed!.title || '',
        userFeedId: userFeed!.id,
        digestType: userFeed!.schedule,
      });
    }
    return { userFeed: { ...userFeed, feed } };
  }

  @Mutation(() => UserFeedResponse)
  async activateFeed(
    @Arg('token') token: string,
    @Arg('userFeedId') userFeedId: string,
    @Ctx() { redis, watcherQueue, db }: MyContext,
  ) {
    const key = SUBSCRIPTION_CONFIRM_PREFIX + token;
    const id = await redis.get(key);
    if (id !== userFeedId) {
      return { errors: [new ArgumentError('token', 'wrong or expired token')] };
    }

    const result = await activateUserFeed(db, {
      userFeedId: parseInt(userFeedId),
      onSuccess: async (_, f) => {
        if (!f) return;
        void updateFeedData(f.url, true);
        await watcherQueue.enqueueFeed(f);
      },
    });

    if (result.errors || !result.userFeed) return { errors: result.errors };

    // + verify email
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, result.userFeed.userId))
      .execute();

    await redis.del(key);
    return result;
  }

  /**
   * If user has verified their email they can activate
   * anonymously added feed that wasn't yet activated
   * */
  @UseMiddleware(auth())
  @Mutation(() => UserFeedResponse)
  async setFeedActivated(
    @Arg('userFeedId') userFeedId: number,
    @Ctx() { req, db, watcherQueue }: MyContext,
  ) {
    const { userId } = req.session;
    const selectedUsers = await db.select().from(users).where(eq(users.id, userId));
    const user = selectedUsers[0];
    if (!user?.emailVerified) {
      return { errors: [{ message: "user didn't verified email" }] };
    }
    return activateUserFeed(db, {
      userFeedId,
      userId,
      onSuccess: (_, f) => watcherQueue.enqueueFeed(f),
    });
  }

  /* Delete feeds from current user */
  @UseMiddleware(auth())
  @Mutation(() => DeletedFeedResponse)
  async deleteMyFeeds(
    @Args() { ids }: DeleteFeedArgs, //
    @Ctx() { req, db }: MyContext,
  ) {
    try {
      const results = await db
        .delete(userFeeds)
        .where(and(inArray(userFeeds.id, ids), eq(userFeeds.userId, req.session.userId)))
        .returning({ id: userFeeds.id });
      return { ids: results.map((r) => r.id) };
    } catch (error) {
      console.error(`Couldn't delete: ${error.message}`);
      return { errors: [new ArgumentError('ids', "Couldn't delete")] };
    }
  }

  @UseMiddleware(auth())
  @NormalizeAndValidateArgs([UserFeedOptionsInput, 'opts'])
  @Mutation(() => UserFeedResponse)
  async setFeedOptions(
    @Arg('id') id: number,
    @Arg('opts') opts: UserFeedOptionsInput,
    @Ctx() { req, db }: MyContext,
  ) {
    const updatedRows = await db
      .update(userFeeds)
      .set(opts)
      .where(and(eq(userFeeds.id, id), eq(userFeeds.userId, req.session.userId)))
      .returning();
    return { userFeed: updatedRows[0] };
  }

  @Query(() => UserFeed, { nullable: true })
  async getFeedInfoByToken(
    @Arg('token') token: string,
    @Arg('id') id: string,
    @Ctx() { db }: MyContext,
  ) {
    if (!token || !id) return null;
    const selected = await db.query.userFeeds.findMany({
      with: { feed: true },
      where: and(eq(userFeeds.unsubscribeToken, token), eq(userFeeds.id, Number(id))),
    });
    return selected[0];
  }

  @Mutation(() => Boolean)
  async unsubscribeByToken(
    @Arg('token') token: string,
    @Arg('id') id: string,
    @Ctx() { db }: MyContext,
  ) {
    if (!token || !id) return false;
    const updatedRows = await db
      .update(userFeeds)
      .set({ schedule: DigestSchedule.disable })
      .where(and(eq(userFeeds.unsubscribeToken, token), eq(userFeeds.id, Number(id))))
      .returning();
    return updatedRows.length > 0;
  }

  @UseMiddleware(auth())
  @Mutation(() => UserFeed, { nullable: true })
  async setLastViewedItemDate(
    @Arg('userFeedId') userFeedId: number,
    @Arg('itemId') itemId: number,
    @Ctx() { req, db }: MyContext,
  ) {
    const { userId } = req.session;
    return setLastViewedItemDate(db, { itemId, userFeedId, userId });
  }

  @FieldResolver(() => Number)
  async newItemsCount(@Root() root: UserFeed, @Ctx() { itemCountLoader }: MyContext) {
    return itemCountLoader.load(root.id);
  }

  @Subscription(() => [UserFeedNewItemsCountResponse], {
    // Get user feed ids to skip users without updates and pass ids inside context.
    // This way there would be only one db query.
    filter: async ({ payload, context }: { payload: NewItemsPayload; context: MyContext }) => {
      const userId = context.req?.session?.userId;
      if (!userId) return false;
      const resp = await updatedFeedLoader.load({
        userId: userId,
        mapFeedToCount: payload,
      });
      if (resp) {
        context.itemsCountUpdate = resp;
        return true;
      }
      return false;
    },
    topics: PubSubTopics.newItems,
  })
  async itemsCountUpdated(@Ctx() ctx: MyContext) {
    return ctx.itemsCountUpdate;
  }

  @UseMiddleware(auth(Role.ADMIN))
  @Mutation(() => Boolean)
  async testFeedUpdate(
    @Arg('feedId') feedId: number,
    @Arg('count') count: number,
    @PubSub() pubSub: PubSubEngine,
  ) {
    await pubSub.publish(PubSubTopics.newItems, {
      [feedId]: { count },
    } as NewItemsPayload);
    return true;
  }

  @UseMiddleware(auth())
  @Mutation(() => ImportFeedsResponse)
  async importFeeds(@Args() { feeds }: ImportFeedsArgs, @Ctx() { req, db }: MyContext) {
    return launchFeedsImport(db, feeds, req.session.userId);
  }

  @UseMiddleware(auth())
  @Query(() => ImportStatusObject, { nullable: true })
  async importStatus(@Ctx() { req }: MyContext) {
    const status = new ImportStatus(req.session.userId);
    return status.getCurrent();
  }
}
