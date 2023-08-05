import { IOptions } from '#entities';
import { ShareId, Theme } from '#root/types/enums.js';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Options implements IOptions {
  userId: number;

  @Field()
  dailyDigestHour: number;

  @Field()
  withContentTableDefault: boolean;

  @Field()
  itemBodyDefault: boolean;

  @Field({ defaultValue: true })
  attachmentsDefault: boolean;

  @Field(() => Theme)
  themeDefault: Theme;

  @Field({ nullable: true })
  customSubject?: string;

  @Field()
  shareEnable: boolean;

  @Field(() => [ShareId], { nullable: true })
  shareList?: string[];
}
