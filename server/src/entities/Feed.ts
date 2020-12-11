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

    @Field()
    @Column({ default: '', nullable: true })
    title: string;

    @Field()
    @Column({ default: '', nullable: true })
    description: string;

    @Field()
    @Column({ default: false })
    activated: boolean;

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

    @Field(() => Date, { nullable: true })
    @Column({ nullable: true })
    lastSuccessful: Date;

    // TODO: should be protected
    @Field(() => [UserFeed], { nullable: true })
    @OneToMany(() => UserFeed, (userFeed) => userFeed.feed, { nullable: true })
    userFeeds: UserFeed[];

    // @Field(() => [FeedItem], { nullable: true })
    // @OneToMany(() => FeedItem, (item) => item.feed, { nullable: true })
    // items: FeedItem[]

    @Field(() => Date)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => Date)
    @UpdateDateColumn()
    updatedAt: Date;
}
