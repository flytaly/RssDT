import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection, getManager } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { SUBSCRIPTION_CONFIRM_PREFIX } from '../constants';
import { Item } from '../entities/Item';
import { User } from '../entities/User';
import { UserFeed } from '../entities/UserFeed';
import { auth } from '../middlewares/auth';
import { NormalizeAndValidateArgs } from '../middlewares/normalize-validate-args';
import { MyContext } from '../types';
import { DigestSchedule } from '../types/enums';
import { ArgumentError } from './common/ArgumentError';
import { subscriptionVerifyEmail } from './common/confirmationMail';
import { createUserFeed } from './common/createUserFeed';
import { activateUserFeed } from './common/feedDBQueries';
import { getUserFeeds } from './common/getUserFeeds';
import {
  AddFeedEmailInput,
  AddFeedInput,
  UserFeedOptionsInput,
  UserInfoInput,
} from './common/inputs';
import { setLastViewedItemDate } from './common/setLastViewedItemDate';

@ObjectType()
class UserFeedResponse {
  @Field(() => [ArgumentError], { nullable: true })
  errors?: ArgumentError[];

  @Field(() => UserFeed, { nullable: true })
  userFeed?: UserFeed;
}

@ArgsType()
export class DeleteFeedArgs {
  @Field(() => [Number])
  ids: number[];
}

@ObjectType()
class DeletedFeedResponse {
  @Field(() => [ArgumentError], { nullable: true })
  errors?: ArgumentError[];

  @Field(() => [String], { nullable: true })
  ids?: string[];
}

@Resolver(UserFeed)
export class UserFeedResolver {
  @UseMiddleware(auth())
  @Query(() => [UserFeed], { nullable: true })
  async myFeeds(@Ctx() { req }: MyContext) {
    return getUserFeeds(req.session.userId);
  }

  /* Add feed digest to user with given email. If user doesn't exist
    this mutation creates new account without password. */
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
    const results = await createUserFeed({ url, email, userId: null, userInfo, feedOpts });
    if (results.errors) return { errors: results.errors };

    const { title } = results.feed!;
    const { id: userFeedId, schedule: digestType } = results.userFeed!;
    await subscriptionVerifyEmail(redis, { email, title, userFeedId, digestType });

    return { userFeed: results.userFeed };
  }

  /* Add feed to current user account */
  @UseMiddleware(auth())
  @NormalizeAndValidateArgs([AddFeedInput, 'input'])
  @Mutation(() => UserFeedResponse)
  async addFeedToCurrentUser(
    @Arg('input') { feedUrl: url }: AddFeedInput,
    @Arg('feedOpts', { nullable: true }) feedOpts: UserFeedOptionsInput,
    @Ctx() { req, redis }: MyContext,
  ) {
    const { errors, userFeed, feed, user } = await createUserFeed({
      url,
      email: null,
      userId: req.session.userId,
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
  @Mutation(() => UserFeedResponse)
  async setFeedOptions(
    @Ctx() { req }: MyContext,
    @Arg('id') id: number,
    @Arg('opts') opts: UserFeedOptionsInput,
  ) {
    const updateDigestTime = opts.schedule && opts.schedule !== DigestSchedule.disable;
    const valuesToSet: QueryDeepPartialEntity<UserFeed> = updateDigestTime
      ? { ...opts, lastDigestSentAt: new Date() }
      : opts;

    const result = await getConnection()
      .createQueryBuilder()
      .update(UserFeed)
      .set(valuesToSet)
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
}
