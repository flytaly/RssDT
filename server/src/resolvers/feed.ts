import { Feed, Item } from '#entities';
import { items, userFeeds } from '#root/db/schema.js';
import { and, desc, eq, sql } from 'drizzle-orm';
import PgTsquery from 'pg-tsquery';
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
import { auth } from '../middlewares/auth.js';
import { MyContext } from '../types/index.js';

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
    @Ctx() { req, db }: MyContext,
  ) {
    if (filter && filter.length > 250) throw new Error('too long');

    const selectedFeeds = await db
      .select()
      .from(userFeeds)
      .where(and(eq(userFeeds.userId, req.session.userId), eq(userFeeds.feedId, feedId)));

    if (!selectedFeeds.length) throw new Error("couldn't find the feed");

    const limit = Math.min(40, Math.max(1, take));
    const limitPlusOne = limit + 1;

    const where = sql`${items.feedId} = ${feedId}`;

    if (filter) {
      const query = pgTsquery(filter);
      where.append(sql` AND to_tsvector(${items.title}) @@ to_tsquery(${query})`);
    }

    const results = await db.query.items.findMany({
      where,
      with: { enclosures: true },
      orderBy: [desc(items.createdAt), desc(items.pubdate)],
      limit: limitPlusOne,
      offset: skip,
    });

    const selectedItems = results;

    const hasMore = selectedItems.length === limitPlusOne;
    return { items: selectedItems.splice(0, limit), hasMore };
  }
}
