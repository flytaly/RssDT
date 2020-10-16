import {
    Arg,
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
import { Feed } from '../entities/Feed';
import { UserFeed } from '../entities/UserFeed';
import { auth } from '../middlewares/auth';
import { MyContext } from '../types';
import { createUserFeed } from './common/createUserFeed';
import { FieldError } from './common/FieldError';

@ObjectType()
class UserFeedResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => UserFeed, { nullable: true })
    userFeed?: UserFeed;
}

@Resolver(UserFeed)
export class UserFeedResolver {
    @FieldResolver(() => [UserFeed])
    async feed(@Root() root: UserFeed) {
        // TODO: use dataloader
        if (!root.feedId) return null;
        return Feed.findOne({ where: { id: root.feedId } });
    }

    @UseMiddleware(auth())
    @Query(() => [UserFeed], { nullable: true })
    async myFeeds(@Ctx() { req }: MyContext) {
        return UserFeed.find({ where: { userId: req.session.userId } });
    }

    /* Add feed digest to user with given email. If user doesn't exist
    this mutation creates new account without password. */
    @Mutation(() => UserFeedResponse, { nullable: true })
    async addFeedWithEmail(
        @Arg('email') email: string, //
        @Arg('feedUrl') url: string,
    ) {
        // TODO: url validation
        return createUserFeed({ url, email, userId: null });
    }

    /* Add feed to current user account */
    @UseMiddleware(auth())
    @Mutation(() => UserFeedResponse)
    async addFeedToCurrentUser(
        @Arg('feedUrl') url: string, //
        @Ctx() { req }: MyContext,
    ) {
        return createUserFeed({ url, email: null, userId: req.session.userId });
    }
}
