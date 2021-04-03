/* eslint-disable import/no-cycle */
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from '#entities';
import { ShareId, Theme } from '../types/enums';

@ObjectType()
@Entity('options')
export class Options extends BaseEntity {
  @PrimaryColumn()
  userId: number;

  @OneToOne(() => User, (user) => user.options, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

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
