import {
    Arg,
    Args,
    ArgsType,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { UserFeed } from '../entities/UserFeed';
import { auth } from '../middlewares/auth';
import { MyContext } from '../types';
import { createUserFeed } from './common/createUserFeed';
import { ArgumentError } from './common/ArgumentError';
import { NormalizeAndValidateArgs } from '../middlewares/normalize-validate-args';
import { getUserFeeds } from './common/getUserFeeds';
import {
    AddFeedEmailInput,
    AddFeedInput,
    UserFeedOptionsInput,
    UserInfoInput,
} from './common/inputs';
import { subscriptionVerifyEmail } from './common/confirmationMail';
import { SUBSCRIPTION_CONFIRM_PREFIX } from '../constants';
import { Feed } from '../entities/Feed';
import { activateUserFeed } from './common/feedDBQueries';

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
        @Arg('input') { email, feedUrl: url }: AddFeedEmailInput, //
        @Arg('userInfo', { nullable: true }) userInfo: UserInfoInput, //
        @Ctx() { redis }: MyContext,
    ) {
        const { errors, userFeed, feed } = await createUserFeed({
            url,
            email,
            userId: null,
            userInfo,
        });
        if (!errors) {
            await subscriptionVerifyEmail(redis, email, feed!.title, userFeed!.id);
        }
        return { errors, userFeed };
    }

    /* Add feed to current user account */
    @UseMiddleware(auth())
    @NormalizeAndValidateArgs([AddFeedInput, 'input'])
    @Mutation(() => UserFeedResponse)
    async addFeedToCurrentUser(
        @Arg('input') { feedUrl: url }: AddFeedInput, //
        @Ctx() { req }: MyContext,
    ) {
        return createUserFeed({ url, email: null, userId: req.session.userId });
    }

    @Mutation(() => UserFeedResponse)
    async activateFeed(
        @Arg('token') token: string,
        @Arg('id') userFeedId: string,
        @Ctx() { redis }: MyContext,
    ) {
        const key = SUBSCRIPTION_CONFIRM_PREFIX + token;
        const id = await redis.get(key);
        if (id !== userFeedId) {
            return { errors: [new ArgumentError('token', 'wrong or expired token')] };
        }
        const userFeed = await activateUserFeed(parseInt(userFeedId));
        await redis.del(key);
        return { userFeed };
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
        const result = await getConnection()
            .createQueryBuilder()
            .update(UserFeed)
            .set({ ...opts })
            .where('id = :id', { id })
            .andWhere('userId = :userId', { userId: req.session.userId })
            .returning('*')
            .execute();
        return { userFeed: result.raw[0] as UserFeed };
    }
}
