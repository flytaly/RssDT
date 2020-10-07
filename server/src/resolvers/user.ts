import argon2 from 'argon2';
import { Arg, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import { User } from '../entities/User';

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
    email: string;

    @Field()
    password: string;
}

@Resolver()
export class UserResolver {
    @Query(() => [User], { nullable: true })
    users() {
        return User.find();
    }

    @Mutation(() => UserResponse)
    async register(@Arg('params') params: EmailPasswordInput) {
        // TODO: VALIDATION
        const { email, password: plainPassword } = params;
        const password = await argon2.hash(plainPassword);
        let user: User | undefined;

        try {
            user = await User.create({ email, password }).save();
        } catch (err) {
            if (err.code === '23505') {
                return { errors: [{ field: 'email', message: 'User already exists' }] };
            }
        }

        return { user };
    }
}
