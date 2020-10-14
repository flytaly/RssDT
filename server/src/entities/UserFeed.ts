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
import { Feed } from './Feed';
import { User } from './User';

@ObjectType()
@Entity()
export class UserFeed extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    userId: number;

    @Field()
    @Column()
    feedId: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.userFeeds)
    user: User;

    @Field(() => Feed)
    @ManyToOne(() => Feed, (feed) => feed.userFeeds)
    feed: Feed;

    @Field()
    @Column({ default: false })
    activated: boolean;

    @Field(() => Date)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => Date)
    @UpdateDateColumn()
    updatedAt: Date;
}
