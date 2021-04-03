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
import { getConnection } from 'typeorm';
// eslint-disable-next-line import/extensions
import { User, UserFeed } from '#entities';

import { maxItemsPerUser, SUBSCRIPTION_CONFIRM_PREFIX } from '../constants.js';
import { auth } from '../middlewares/auth.js';
import { NormalizeAndValidateArgs } from '../middlewares/normalize-validate-args.js';
import { rateLimit } from '../middlewares/rate-limit.js';
import { MyContext, Role } from '../types/index.js';
import { DigestSchedule } from '../types/enums.js';
import { createUpdatedFeedLoader } from '../utils/createUpdatedFeedLoader.js';
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
  async myFeeds(@Ctx() { req }: MyContext) {
    return getUserFeeds(req.session.userId);
  }

  /* Add feed digest to user with given email. If user doesn't exist
    this mutation creates new account without password. */
  @UseMiddleware(rateLimit(20, 60 * 10))
  @NormalizeAndValidateArgs([AddFeedEmailInput, 'input'], [UserInfoInput, 'userInfo'])
  @Mutation(() => UserFeedResponse, { nullable: true })
  async addFeedWithEmail(
    @Arg('input') { email, feedUrl: url }: AddFeedEmailInput,
    @Arg('userInfo', { nullable: true }) userInfo: UserInfoInput,
    @Arg('feedOpts', { nullable: true }) feedOpts: UserFeedOptionsInput,
    @Ctx() { redis }: MyContext,
  ) {
    feedOpts = feedOpts || {};
    if (!feedOpts.schedule || feedOpts.schedule === DigestSchedule.disable) {
      feedOpts.schedule = DigestSchedule.daily;
    }
    const userWithCount = await getUserAndCountFeeds({ email });
    if (userWithCount && userWithCount.countFeeds >= maxItemsPerUser) {
      return { errors: [new ArgumentError('feeds', 'Too many feeds')] };
    }

    const results = await createUserFeed({ url, email, user: userWithCount, userInfo, feedOpts });
    if (results.errors) return { errors: results.errors };

    const { title } = results.feed!;
    const { id: userFeedId, schedule: digestType } = results.userFeed!;
    await subscriptionVerifyEmail(redis, { email, title, userFeedId, digestType });

    return { userFeed: results.userFeed };
  }

  /* Add feed to current user account */
  @UseMiddleware(auth(), rateLimit(60, 60))
  @NormalizeAndValidateArgs([AddFeedInput, 'input'])
  @Mutation(() => UserFeedResponse)
  async addFeedToCurrentUser(
    @Arg('input') { feedUrl: url }: AddFeedInput,
    @Arg('feedOpts', { nullable: true }) feedOpts: UserFeedOptionsInput,
    @Ctx() { req, redis }: MyContext,
  ) {
    const { userId } = req.session;
    const userWithCount = await getUserAndCountFeeds({ userId });
    const { errors, userFeed, feed, user } = await createUserFeed({
      url,
      email: null,
      user: userWithCount,
      feedOpts,
    });
    if (errors) return { errors };

    if (userFeed?.schedule !== 'disable' && !user?.emailVerified) {
      await subscriptionVerifyEmail(redis, {
        email: user!.email,
        title: feed!.title,
        userFeedId: userFeed!.id,
        digestType: userFeed!.schedule,
      });
    }
    return { userFeed };
  }

  @Mutation(() => UserFeedResponse)
  async activateFeed(
    @Arg('token') token: string,
    @Arg('userFeedId') userFeedId: string,
    @Ctx() { redis }: MyContext,
  ) {
    const key = SUBSCRIPTION_CONFIRM_PREFIX + token;
    const id = await redis.get(key);
    if (id !== userFeedId) {
      return { errors: [new ArgumentError('token', 'wrong or expired token')] };
    }
    const result = await activateUserFeed(parseInt(userFeedId));
    await redis.del(key);
    return result;
  }

  /**  If user has verified their email they can activate anonymously added feed
    that wasn't yet activated */
  @UseMiddleware(auth())
  @Mutation(() => UserFeedResponse)
  async setFeedActivated(@Arg('userFeedId') userFeedId: number, @Ctx() { req }: MyContext) {
    const { userId } = req.session;
    const user = await User.findOne(userId);
    if (!user?.emailVerified) {
      return { errors: [{ message: "user didn't verified email" }] };
    }
    return activateUserFeed(userFeedId, userId);
  }

  /* Delete feed from current user */
  @UseMiddleware(auth())
  @Mutation(() => DeletedFeedResponse)
  async deleteMyFeeds(
    @Args() { ids }: DeleteFeedArgs, //
    @Ctx() { req }: MyContext,
  ) {
    try {
      const result = await getConnection()
        .getRepository(UserFeed)
        .createQueryBuilder('uf')
        .delete()
        .where('userId = :userId', { userId: req.session.userId })
        .andWhereInIds(ids)
        .returning('id')
        .execute();
      return { ids: result.raw.map((r: UserFeed) => r.id) };
    } catch (error) {
      console.error(`Couldn't delete: ${error.message}`);
      return { errors: [new ArgumentError('ids', "Couldn't delete")] };
    }
  }

  @UseMiddleware(auth())
  @NormalizeAndValidateArgs([UserFeedOptionsInput, 'opts'])
  @Mutation(() => UserFeedResponse)
  async setFeedOptions(
    @Ctx() { req }: MyContext,
    @Arg('id') id: number,
    @Arg('opts') opts: UserFeedOptionsInput,
  ) {
    // const updateDigestTime = opts.schedule && opts.schedule !== DigestSchedule.disable;
    // const valuesToSet: QueryDeepPartialEntity<UserFeed> = updateDigestTime
    //   ? { ...opts, lastDigestSentAt: new Date() }
    //   : opts;

    const result = await getConnection()
      .createQueryBuilder()
      .update(UserFeed)
      .set(opts)
      .where('id = :id', { id })
      .andWhere('userId = :userId', { userId: req.session.userId })
      .returning('*')
      .execute();
    return { userFeed: result.raw[0] as UserFeed };
  }

  @Query(() => UserFeed, { nullable: true })
  async getFeedInfoByToken(@Arg('token') token: string, @Arg('id') id: string) {
    if (!token || !id) return null;
    return UserFeed.findOne({ unsubscribeToken: token, id: Number(id) }, { relations: ['feed'] });
  }

  @Mutation(() => Boolean)
  async unsubscribeByToken(@Arg('token') token: string, @Arg('id') id: string) {
    if (!token || !id) return false;
    const result = await getConnection()
      .createQueryBuilder()
      .update(UserFeed)
      .set({ schedule: DigestSchedule.disable })
      .where('id = :id', { id })
      .andWhere('unsubscribeToken = :token', { token })
      .execute();
    if (result?.affected) return true;
    return false;
  }

  @UseMiddleware(auth())
  @Mutation(() => UserFeed, { nullable: true })
  async setLastViewedItemDate(
    @Arg('userFeedId') userFeedId: number,
    @Arg('itemId') itemId: number,
    @Ctx() { req }: MyContext,
  ) {
    const { userId } = req.session;
    return setLastViewedItemDate({ itemId, userFeedId, userId });
  }

  @FieldResolver(() => Number)
  async newItemsCount(@Root() root: UserFeed, @Ctx() { itemCountLoader }: MyContext) {
    return itemCountLoader.load(root.id);
  }

  @Subscription(() => [UserFeedNewItemsCountResponse], {
    // Get user feed ids to skip users without updates and pass ids inside context.
    // This way there would be only one db query.
    filter: async ({ payload, context }) => {
      const resp = await updatedFeedLoader.load({
        userId: context.req.session.userId,
        mapFeedToCount: payload,
      });
      if (resp) {
        (context as any).itemsCountUpdate = resp;
        return true;
      }
      return false;
    },
    topics: PubSubTopics.newItems,
  })
  async itemsCountUpdated(@Ctx() ctx: MyContext) {
    return (ctx as any).itemsCountUpdate;
  }

  @UseMiddleware(auth(Role.ADMIN))
  @Mutation(() => Boolean)
  async testFeedUpdate(
    @Arg('feedId') feedId: number,
    @Arg('count') count: Number,
    @PubSub() pubSub: PubSubEngine,
  ) {
    await pubSub.publish(PubSubTopics.newItems, {
      [feedId]: { count },
    } as NewItemsPayload);
    return true;
  }

  @UseMiddleware(auth())
  @Mutation(() => ImportFeedsResponse)
  async importFeeds(@Args() { feeds }: ImportFeedsArgs, @Ctx() { req }: MyContext) {
    return launchFeedsImport(feeds, req.session.userId);
  }

  @UseMiddleware(auth())
  @Query(() => ImportStatusObject, { nullable: true })
  async importStatus(@Ctx() { req }: MyContext) {
    const status = new ImportStatus(req.session.userId);
    return status.getCurrent();
  }
}
