import { ObjectType, Field } from 'type-graphql';
import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;
}
