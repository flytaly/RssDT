/* eslint-disable import/no-cycle */
import { Field, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Enclosure } from './Enclosure';
import { Feed } from './Feed';

@ObjectType()
@Entity()
export class Item extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    guid: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    pubdate: Date;

    @Field({ nullable: true })
    @Column({ nullable: true })
    link: string;

    @Field({ nullable: true })
    @Column({ type: 'text', default: '', nullable: true })
    title: string;

    @Field({ nullable: true })
    @Column({ type: 'text', default: '', nullable: true })
    description: string;

    @Field({ nullable: true })
    @Column({ type: 'text', default: '', nullable: true })
    summary: string;

    @Field({ nullable: true })
    @Column({ default: '', nullable: true })
    imageUrl: string;

    @Column({ nullable: true })
    feedId: number;

    @Field(() => Feed)
    @ManyToOne(() => Feed, (feed) => feed.items, { onDelete: 'CASCADE' })
    feed: Feed;

    @Field(() => [Enclosure], { nullable: true })
    @OneToMany(() => Enclosure, (enc) => enc.item, { nullable: true, eager: true, cascade: true })
    enclosures: Enclosure[];

    @Field(() => Date)
    @CreateDateColumn()
    createdAt: Date;
}
