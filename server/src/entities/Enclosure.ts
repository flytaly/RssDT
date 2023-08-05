import { IEnclosure, Item } from '#entities';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Enclosure implements IEnclosure {
  id: number;

  @Field()
  url: string;

  @Field({ nullable: true })
  length: string;

  @Field({ nullable: true })
  type?: string;

  item: Item;
}
