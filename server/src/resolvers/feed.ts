import {
  Args,
  ArgsType,
  Ctx,
  Field,
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
  count: number;

  @Field()
  hasMore: boolean;
}

@ArgsType()
export class ItemsArgs {
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
    @Args() { skip = 0, take, feedId }: ItemsArgs, //
    @Ctx() { req }: MyContext,
  ) {
    const uf = await UserFeed.findOne({
      where: { feedId, userId: req.session.userId },
    });

    if (!uf) throw new Error("couldn't find feed");

    const [items, count] = await Item.findAndCount({
      skip,
      take: Math.min(40, Math.max(1, take)),
      where: { feedId },
      order: { createdAt: 'DESC', pubdate: 'DESC' },
    });
    const hasMore = count > skip + take;
    return { items, count, hasMore };
  }
}
