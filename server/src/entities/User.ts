/* eslint-disable import/no-cycle */
import { ObjectType, Field } from 'type-graphql';
import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { UserFeed } from './UserFeed';
import { Role } from '../types';
import { Options } from './Options';
import { defaultLocale, defaultTimeZone } from '../constants';

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Field()
    @Column({ default: false })
    emailVerified!: boolean;

    @Field()
    @Column({ default: Role.USER })
    role: Role;

    @Field()
    @Column({ default: defaultLocale })
    locale: string;

    @Field()
    @Column({ default: defaultTimeZone })
    timeZone: string;

    @Field(() => [UserFeed], { nullable: true })
    @OneToMany(() => UserFeed, (userFeed) => userFeed.user, { nullable: true })
    userFeeds: UserFeed[];

    @Field(() => Options)
    @OneToOne(() => Options, (opts) => opts.user, { cascade: true, eager: true })
    options: Options;

    @Field(() => Date)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => Date)
    @UpdateDateColumn()
    updatedAt: Date;

    // === DB ONLY FIELDS ===

    @Column({ nullable: true, default: null })
    password?: string;
}
