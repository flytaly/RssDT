import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class ArgumentError {
  constructor(argument: string | null, message: string) {
    this.argument = argument;
    this.message = message;
  }

  @Field(() => String, { nullable: true })
  argument?: string | null;

  @Field()
  message: string;
}
