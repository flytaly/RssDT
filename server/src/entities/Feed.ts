/* eslint-disable import/no-cycle */
import FeedParser from 'feedparser';
import { Field, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { filterMeta } from '../feed-parser/filter-item';
import { UserFeed } from './UserFeed';
import { Item } from './Item';

@ObjectType()
@Entity()
export class Feed extends BaseEntity {
    addMeta(meta?: FeedParser.Meta) {
        const metaFiltered = filterMeta(meta);
        Object.assign(this, metaFiltered);
    }

    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    url!: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    link: string;

    @Field({ nullable: true })
    @Column({ default: '', nullable: true })
    title: string;

    @Field({ nullable: true })
    @Column({ type: 'text', default: '', nullable: true })
    description: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    language: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    favicon: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    imageUrl: string;

    @Field({ nullable: true })
    @Column({ default: '', nullable: true })
    imageTitle: string;

    @Field(() => Date)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => Date)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => Date)
    @Column({ default: new Date(0) })
    lastSuccessfulUpd: Date;

    // TODO: should be protected
    @Field(() => [UserFeed], { nullable: true })
    @OneToMany(() => UserFeed, (userFeed) => userFeed.feed, { nullable: true })
    userFeeds: UserFeed[];

    // === DB ONLY FIELDS ===

    @Column({ default: false })
    activated: boolean;

    @Column({ default: new Date(0) })
    lastUpdAttempt: Date;

    @OneToMany(() => Item, (item) => item.feed, { nullable: true })
    items: Item[];

    @Column({ default: 0 })
    throttled: number;
}
