import { ObjectType, Field } from 'type-graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  BaseEntity,
} from 'typeorm';
// eslint-disable-next-line import/extensions
import { UserFeed, Options, IOptions, IUser, IUserFeed } from '#entities';
import { Role } from '../types/index.js';
import { defaultLocale, defaultTimeZone } from '../constants.js';

@ObjectType()
@Entity()
export class User extends BaseEntity implements IUser {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 255, unique: true })
  email: string;

  @Field()
  @Column({ default: false })
  emailVerified: boolean;

  @Field()
  @Column({ default: Role.USER })
  role: Role;

  @Field()
  @Column({ length: 200, default: defaultLocale })
  locale: string;

  @Field()
  @Column({ length: 100, default: defaultTimeZone })
  timeZone: string;

  @Field(() => [UserFeed], { nullable: true })
  @OneToMany('UserFeed', 'user', { nullable: true })
  userFeeds?: IUserFeed[];

  @Field(() => Options)
  @OneToOne('Options', 'user', { cascade: true, eager: true })
  options: IOptions;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  // === DB ONLY FIELDS ===

  @Column({ nullable: true, default: null })
  password?: string;

  @Column({ nullable: true, default: false })
  deleted?: boolean;
}
