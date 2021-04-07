import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
// eslint-disable-next-line import/extensions
import { IUser, IOptions } from '#entities';
import { ShareId, Theme } from '../types/enums.js';

@ObjectType()
@Entity('options')
export class Options extends BaseEntity implements IOptions {
  @OneToOne('User', 'options', { onDelete: 'CASCADE' })
  @JoinColumn()
  user: IUser;

  @PrimaryColumn()
  userId: number;

  @Field()
  @Column({ default: 18 })
  dailyDigestHour: number;

  @Field()
  @Column({ default: false })
  withContentTableDefault: boolean;

  @Field()
  @Column({ default: true })
  itemBodyDefault: boolean;

  @Field({ defaultValue: true })
  @Column({ default: true })
  attachmentsDefault: boolean;

  @Field(() => Theme)
  @Column({ type: 'enum', enum: Theme, default: Theme.default })
  themeDefault: Theme;

  @Field({ nullable: true })
  @Column({ length: 150, nullable: true })
  customSubject?: string;

  @Field()
  @Column({ default: true })
  shareEnable: boolean;

  @Field(() => [ShareId], { nullable: true })
  @Column('varchar', { array: true, default: {}, nullable: true })
  shareList?: string[];
}
