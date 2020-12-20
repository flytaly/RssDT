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
    @Column({ type: 'enum', enum: DigestSchedule, default: DigestSchedule.daily })
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

    @Field(() => Date)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => Date)
    @UpdateDateColumn()
    updatedAt: Date;

    // === DB ONLY FIELDS ===
    @Column()
    userId: number;

    @Column()
    feedId: number;

    @Column({ nullable: true })
    unsubscribeToken: string;
}
