import { IOptions, IUser, IUserFeed, Options, UserFeed } from '#entities';
import { Role } from '#root/types/index.js';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class User implements IUser {
  @Field()
  id: number;

  @Field()
  email: string;

  @Field()
  emailVerified: boolean;

  @Field()
  role: Role;

  @Field()
  locale: string;

  @Field()
  timeZone: string;

  @Field(() => [UserFeed], { nullable: true })
  userFeeds?: IUserFeed[];

  @Field(() => Options)
  options: IOptions;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  password?: string;

  deleted?: boolean;
}
