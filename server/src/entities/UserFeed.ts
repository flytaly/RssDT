/* eslint-disable import/no-cycle */
import { Field, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DigestSchedule, TernaryState, Theme } from '../types/enums';
import { Feed } from './Feed';
import { User } from './User';

@ObjectType()
@Entity()
export class UserFeed extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.userFeeds, { onDelete: 'CASCADE' })
  user: User;

  @Field(() => Feed)
  @ManyToOne(() => Feed, (feed) => feed.userFeeds, { onDelete: 'CASCADE' })
  feed: Feed;

  @Field()
  @Column({ default: false })
  activated: boolean;

  @Field(() => DigestSchedule)
  @Column({ type: 'enum', enum: DigestSchedule, default: DigestSchedule.disable })
  schedule: DigestSchedule;

  @Field(() => TernaryState)
  @Column({ type: 'enum', enum: TernaryState, default: TernaryState.default })
  withContentTable: TernaryState;

  @Field(() => TernaryState)
  @Column({ type: 'enum', enum: TernaryState, default: TernaryState.default })
  itemBody: TernaryState;

  @Field(() => TernaryState)
  @Column({ type: 'enum', enum: TernaryState, default: TernaryState.default })
  attachments: TernaryState;

  @Field(() => Theme)
  @Column({ type: 'enum', enum: Theme, default: Theme.default })
  theme: Theme;

  @Field({ nullable: true })
  @Column({ length: 250, nullable: true })
  filter?: string;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  lastDigestSentAt?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  lastViewedItemDate?: Date | null;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  // === GraphQL ONLY FIELDS ===
  @Field()
  newItemsCount?: number;

  // === DB ONLY FIELDS ===
  @Column({ type: 'timestamp', nullable: true })
  wasFilteredAt?: Date;

  @Column()
  userId: number;

  @Column()
  feedId: number;

  @Column({ nullable: true, unique: true })
  unsubscribeToken: string;
}
