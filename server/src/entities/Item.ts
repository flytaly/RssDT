import { Field, ObjectType } from 'type-graphql';
import { Enclosure, Feed, IEnclosure, IFeed, IItem } from '#entities';

@ObjectType()
export class Item implements IItem {
  @Field()
  id: number;

  @Field({ nullable: true })
  guid?: string;

  @Field({ nullable: true })
  pubdate?: Date;

  @Field({ nullable: true })
  link?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  summary?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  feedId: number;

  @Field(() => Feed)
  feed: IFeed;

  @Field(() => [Enclosure], { nullable: true })
  enclosures?: IEnclosure[];

  @Field(() => Date)
  createdAt: Date;
}
