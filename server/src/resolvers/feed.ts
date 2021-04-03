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
import { getConnection } from 'typeorm';
import PgTsquery from 'pg-tsquery';
import { Feed, Item, UserFeed } from '#entities';
import { auth } from '../middlewares/auth';
import { MyContext } from '../types';

const pgTsquery = PgTsquery();

@ObjectType()
export class PaginatedItemsResponse {
  @Field(() => [Item])
  items: Item[];

  // @Field()
  // count: number;

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
  take?: number;

  @Field({ nullable: true })
  filter?: string;
}

@Resolver(Feed)
export class FeedResolver {
  @UseMiddleware(auth())
  @Query(() => PaginatedItemsResponse)
  async myFeedItems(
    @Args() { skip = 0, take = 10, feedId, filter }: ItemsArgs, //
    @Ctx() { req }: MyContext,
  ) {
    if (filter && filter.length > 250) throw new Error('too long');

    const uf = await UserFeed.findOne({
      where: { feedId, userId: req.session.userId },
    });

    if (!uf) throw new Error("couldn't find the feed");
    const actualTake = Math.min(40, Math.max(1, take));
    const actualTakePlusOne = actualTake + 1;
    let dbQuery = getConnection() //
      .getRepository(Item)
      .createQueryBuilder('item')
      .select()
      .where('item.feedId = :feedId', { feedId })
      .leftJoinAndSelect('item.enclosures', 'enclosure', 'enclosure.itemId=item.id')
      .take(actualTakePlusOne)
      .skip(skip)
      .orderBy('item.createdAt', 'DESC')
      .addOrderBy('item.pubdate', 'DESC');

    if (filter) {
      dbQuery = dbQuery.andWhere('to_tsvector(item.title) @@ to_tsquery(:query)', {
        query: pgTsquery(filter),
      });
    }
    const items = await dbQuery.getMany();

    const hasMore = items.length === actualTakePlusOne;
    return { items: items.splice(0, actualTake), hasMore };
  }
}
