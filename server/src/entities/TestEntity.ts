import { ObjectType, Field } from 'type-graphql';
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class TestEntity extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    text!: string;
}
