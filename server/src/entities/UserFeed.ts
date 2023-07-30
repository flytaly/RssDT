import { Feed, IFeed, IUser, IUserFeed, User } from '#entities';
import { DigestSchedule, TernaryState, Theme } from '#root/types/enums.js';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class UserFeed implements IUserFeed {
  @Field()
  id: number;

  @Field(() => User)
  user: IUser;

  @Field(() => Feed)
  feed: IFeed;

  @Field()
  activated: boolean;

  @Field({ nullable: true })
  title?: string;

  @Field(() => DigestSchedule)
  schedule: DigestSchedule;

  @Field(() => TernaryState)
  withContentTable: TernaryState;

  @Field(() => TernaryState)
  itemBody: TernaryState;

  @Field(() => TernaryState)
  attachments: TernaryState;

  @Field(() => Theme)
  theme: Theme;

  @Field({ nullable: true })
  filter?: string;

  @Field(() => Date, { nullable: true })
  lastDigestSentAt?: Date;

  @Field(() => Date, { nullable: true })
  lastViewedItemDate?: Date | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // === GraphQL ONLY FIELDS ===
  @Field()
  newItemsCount?: number;

  // === DB ONLY FIELDS ===
  wasFilteredAt?: Date;

  userId: number;

  feedId: number;

  unsubscribeToken: string;
}
