import { ObjectType, Field, ArgsType, InputType } from 'type-graphql';
// eslint-disable-next-line import/extensions
import { UserFeed } from '#entities';
import { DigestSchedule } from '../../types/enums.js';
import { ArgumentError } from './errors.js';

@ObjectType()
export class UserFeedResponse {
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
export class DeletedFeedResponse {
  @Field(() => [ArgumentError], { nullable: true })
  errors?: ArgumentError[];

  @Field(() => [String], { nullable: true })
  ids?: string[];
}

@ObjectType()
export class UserFeedNewItemsCountResponse {
  @Field(() => Number)
  feedId: number;

  @Field(() => Number)
  count: number;
}

@InputType()
export class FeedImport {
  @Field(() => String)
  url: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => DigestSchedule, { nullable: true })
  schedule?: DigestSchedule;
}

@ArgsType()
export class ImportFeedsArgs {
  @Field(() => [FeedImport])
  feeds: FeedImport[];
}

@ObjectType()
export class ImportFeedsResponse {
  @Field(() => [ArgumentError], { nullable: true })
  errors?: ArgumentError[];

  @Field(() => Boolean, { nullable: true })
  success?: boolean;
}
