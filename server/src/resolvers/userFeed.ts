import {
    Arg,
    ArgsType,
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { UserFeed } from '../entities/UserFeed';
import { auth } from '../middlewares/auth';
import { MyContext } from '../types';
import { createUserFeed } from './common/createUserFeed';
import { ArgumentError } from './common/ArgumentError';
import { InputMetadata, NormalizeAndValidateArgs } from '../middlewares/normalize-validate-args';

@ObjectType()
class UserFeedResponse {
    @Field(() => [ArgumentError], { nullable: true })
    errors?: ArgumentError[];

    @Field(() => UserFeed, { nullable: true })
    userFeed?: UserFeed;
}

// @InputType()
@InputType()
export class AddFeedInput {
    @InputMetadata('feedUrl')
    @Field()
    feedUrl: string;
}

@InputType()
class AddFeedEmailInput extends AddFeedInput {
    @InputMetadata('email')
    @Field()
    email: string;
}

@Resolver(UserFeed)
export class UserFeedResolver {
    /*  // Currently it could be accessed from user { feeds { feed } }
    @FieldResolver(() => [UserFeed])
    async feed(@Root() root: UserFeed) {
        if (!root.feedId) return null;
        return Feed.findOne({ where: { id: root.feedId } });
    } */

    @UseMiddleware(auth())
    @Query(() => [UserFeed], { nullable: true })
    async myFeeds(@Ctx() { req }: MyContext) {
        return UserFeed.find({ where: { userId: req.session.userId } });
    }

    /* Add feed digest to user with given email. If user doesn't exist
    this mutation creates new account without password. */
    @NormalizeAndValidateArgs(AddFeedEmailInput, 'input')
    @Mutation(() => UserFeedResponse, { nullable: true })
    async addFeedWithEmail(
        @Arg('input') { email, feedUrl: url }: AddFeedEmailInput, //
    ) {
        return createUserFeed({ url, email, userId: null });
    }

    /* Add feed to current user account */
    @UseMiddleware(auth())
    @NormalizeAndValidateArgs(AddFeedInput, 'input')
    @Mutation(() => UserFeedResponse)
    async addFeedToCurrentUser(
        @Arg('input') { feedUrl: url }: AddFeedInput, //
        @Ctx() { req }: MyContext,
    ) {
        return createUserFeed({ url, email: null, userId: req.session.userId });
    }
}
