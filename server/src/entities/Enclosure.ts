/* eslint-disable import/no-cycle */
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Item } from './Item';

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
