import { Field, ObjectType } from 'type-graphql';
import { IFeed, IUserFeed, UserFeed, IItem } from '#entities';

@ObjectType()
export class Feed implements IFeed {
  @Field()
  id: number;

  @Field()
  url: string;

  @Field({ nullable: true })
  link?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  language?: string;

  // A link to the favicon from feed (provided by Atom feeds)
  @Field({ nullable: true })
  favicon?: string;

  // A link to the favicon of the website
  @Field({ nullable: true })
  siteFavicon?: string;

  // A link to the website icon (should be >= 100x100px)
  @Field({ nullable: true })
  siteIcon?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  imageTitle?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date)
  lastSuccessfulUpd: Date;

  @Field(() => Date, { nullable: true })
  lastPubdate?: Date;

  @Field(() => [UserFeed], { nullable: true })
  userFeeds?: IUserFeed[];

  activated: boolean;

  lastUpdAttempt: Date;

  items?: IItem[];

  throttled: number;
}
