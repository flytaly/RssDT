import argon2 from 'argon2';
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Role, User } from '../entities/User';
import { UserFeed } from '../entities/UserFeed';
import { auth } from '../middlewares/auth';
import { MyContext, ReqWithSession } from '../types';
import { ArgumentError } from './common/ArgumentError';
import { NormalizeAndValidateArgs, InputMetadata } from '../middlewares/normalize-validate-args';

const setSession = (req: ReqWithSession, userId: number, role = Role.USER) => {
    req.session.userId = userId;
    req.session.role = role;
};

@ObjectType()
class UserResponse {
    @Field(() => [ArgumentError], { nullable: true })
    errors?: ArgumentError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@InputType()
export class EmailPasswordInput {
    @InputMetadata('email')
    @Field()
    email: string;

    @InputMetadata('password')
    @Field()
    password: string;
}

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => [UserFeed])
    async feeds(@Root() root: User) {
        if (!root.id) return null;
        return getConnection()
            .getRepository(UserFeed)
            .createQueryBuilder('uf')
            .where({ userId: root.id })
            .innerJoinAndSelect('uf.feed', 'f', 'f.id = uf.feedId')
            .getMany();
    }

    @UseMiddleware(auth(Role.ADMIN))
    @Query(() => [User], { nullable: true })
    users() {
        return User.find();
    }

    @UseMiddleware(auth())
    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
        if (!req.session.userId) {
            return null;
        }
        return User.findOne(req.session.userId);
    }

    @NormalizeAndValidateArgs(EmailPasswordInput, 'input')
    @Mutation(() => UserResponse)
    async register(@Arg('input') input: EmailPasswordInput, @Ctx() { req }: MyContext) {
        const { password: plainPassword, email } = input;

        const password = await argon2.hash(plainPassword);
        let user: User | undefined;

        try {
            user = await User.create({ email, password }).save();
        } catch (err) {
            if (err.code === '23505') {
                return { errors: [new ArgumentError('email', 'User already exists')] };
            }
        }

        if (!user) return null;
        setSession(req, user.id, user.role);

        return { user };
    }

    @NormalizeAndValidateArgs(EmailPasswordInput, 'input')
    @Mutation(() => UserResponse)
    async login(@Arg('input') input: EmailPasswordInput, @Ctx() { req }: MyContext) {
        const { password: plainPassword, email } = input;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return {
                errors: [new ArgumentError('email', "User with such email doesn't exist")],
            };
        }

        const isMatch =
            user.password && // password could be empty
            (await argon2.verify(user.password, plainPassword));
        if (!isMatch) {
            return { errors: [new ArgumentError('password', 'Wrong password')] };
        }

        setSession(req, user.id, user.role);

        return { user };
    }
}
