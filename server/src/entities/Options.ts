/* eslint-disable import/no-cycle */
import { Field, ObjectType, registerEnumType } from 'type-graphql';
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

export enum THEME {
    default = 'default',
    text = 'text',
}

registerEnumType(THEME, { name: 'THEME' });

@ObjectType()
@Entity('options')
export class Options extends BaseEntity {
    @PrimaryColumn()
    userId: number;

    @OneToOne(() => User, (user) => user.options, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Field()
    @Column({ default: 18 })
    dailyDigestHour: number;

    @Field()
    @Column({ default: false })
    withContentTableDefault: boolean;

    @Field()
    @Column({ default: true })
    itemBodyDefault: boolean;

    @Field({ defaultValue: true })
    @Column({ default: true })
    attachmentsDefault: boolean;

    @Field(() => THEME)
    @Column({ type: 'enum', enum: THEME, default: THEME.default })
    themeDefault: THEME;

    @Field({ nullable: true })
    @Column({ nullable: true })
    customSubject: string;

    @Field()
    @Column({ default: true })
    shareEnable: boolean;

    @Field(() => [String], { nullable: true })
    @Column('varchar', { array: true, default: {}, nullable: true })
    shareList: string[];
}