import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class ArgumentError {
  constructor(argument: string, message: string) {
    this.argument = argument;
    this.message = message;
  }

  @Field({ nullable: true })
  argument?: string;

  @Field()
  message: string;
}
