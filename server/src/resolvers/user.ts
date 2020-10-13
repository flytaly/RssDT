import argon2 from 'argon2';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import { User } from '../entities/User';
import { MyContext } from '../types';

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@InputType()
export class EmailPasswordInput {
    @Field()
    email!: string;

    @Field()
    password!: string;
}

@Resolver()
export class UserResolver {
    @Query(() => [User], { nullable: true })
    users() {
        return User.find();
    }

    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
        if (!req.session.userId) {
            return null;
        }
        return User.findOne(req.session.userId);
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('email') email: string,
        @Arg('password') plainPassword: string,
        @Ctx() { req }: MyContext,
    ) {
        // TODO: VALIDATION
        const password = await argon2.hash(plainPassword);
        let user: User | undefined;

        try {
            user = await User.create({ email, password }).save();
        } catch (err) {
            if (err.code === '23505') {
                return { errors: [{ field: 'email', message: 'User already exists' }] };
            }
        }

        if (!user) return null;

        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') plainPassword: string,
        @Ctx() { req }: MyContext,
    ) {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return { errors: [{ field: 'email', message: "User with such email don't exist" }] };
        }
        const isMatch = await argon2.verify(user.password, plainPassword);
        if (!isMatch) {
            return { errors: [{ field: 'password', message: 'Wrong password' }] };
        }

        req.session.userId = user.id;

        return { user };
    }
}
