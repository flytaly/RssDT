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
// eslint-disable-next-line import/extensions
import { Enclosure, Feed, IEnclosure, IFeed, IItem } from '#entities';

@ObjectType()
@Entity()
export class Item extends BaseEntity implements IItem {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  guid?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  pubdate?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  link?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', default: '', nullable: true })
  title?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', default: '', nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', default: '', nullable: true })
  summary?: string;

  @Field({ nullable: true })
  @Column({ default: '', nullable: true })
  imageUrl?: string;

  @Column()
  feedId: number;

  @Field(() => Feed)
  @ManyToOne('Feed', 'items', { onDelete: 'CASCADE' })
  feed: IFeed;

  @Field(() => [Enclosure], { nullable: true })
  @OneToMany('Enclosure', 'item', { nullable: true, eager: true, cascade: true })
  enclosures?: IEnclosure[];

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;
}
