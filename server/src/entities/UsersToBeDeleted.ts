import { IUser } from '#entities';
import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@ObjectType()
@Entity()
export class UsersToBeDeleted extends BaseEntity {
  @OneToOne('User')
  @JoinColumn()
  user: IUser;

  @PrimaryColumn()
  userId: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;
}
