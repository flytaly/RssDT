import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class UsersToBeDeleted {
  userId: number;

  @Field(() => Date)
  createdAt: Date;
}
