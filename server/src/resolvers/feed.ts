import {
    Arg,
    Ctx,
    Field,
    InputType,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { Feed } from '../entities/Feed';
import { Item } from '../entities/Item';
import { UserFeed } from '../entities/UserFeed';
import { auth } from '../middlewares/auth';
import { MyContext } from '../types';

@ObjectType()
export class PaginatedItemsResponse {
    @Field(() => [Item])
    items: Item[];

    @Field()
    hasMore: boolean;
}

@InputType()
export class ItemsInput {
    @Field()
    feedId: number;

    @Field({ nullable: true, defaultValue: 0 })
    skip?: number;

    @Field({ nullable: true, defaultValue: 10 })
    take: number;
}

@Resolver(Feed)
export class FeedResolver {
    @UseMiddleware(auth())
    @Query(() => PaginatedItemsResponse)
    async myFeedItems(
        @Arg('input') { skip, take, feedId }: ItemsInput, //
        @Ctx() { req }: MyContext,
    ) {
        const uf = await UserFeed.findOne({
            where: { feedId, userId: req.session.userId },
        });

        if (!uf) throw new Error("couldn't find feed");

        const limitPlusOne = Math.min(40, Math.max(1, take)) + 1;
        const items = await Item.find({
            skip,
            take: limitPlusOne,
            where: { feedId },
            order: { pubdate: 'DESC' },
        });
        return {
            items: items.slice(0, limitPlusOne - 1),
            hasMore: items.length === limitPlusOne,
        };
    }
}
