/* eslint-disable import/no-cycle */
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
// eslint-disable-next-line import/extensions
import { Item } from '#entities';

@ObjectType()
@Entity()
export class Enclosure extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  url: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  length: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  type?: string;

  @ManyToOne(() => Item, (item) => item.enclosures, { onDelete: 'CASCADE' })
  item: Item;
}
