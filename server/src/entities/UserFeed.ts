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
// eslint-disable-next-line import/extensions
import { Feed, User, IUser, IFeed, IUserFeed } from '#entities';
import { DigestSchedule, TernaryState, Theme } from '../types/enums.js';

@ObjectType()
@Entity()
export class UserFeed extends BaseEntity implements IUserFeed {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne('User', 'userFeeds', { onDelete: 'CASCADE' })
  user: IUser;

  @Field(() => Feed)
  @ManyToOne('Feed', 'userFeeds', { onDelete: 'CASCADE' })
  feed: IFeed;

  @Field()
  @Column({ default: false })
  activated: boolean;

  @Field({ nullable: true })
  @Column({ length: 50, nullable: true })
  title?: string;

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
