import argon2 from 'argon2';
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Options } from '../entities/Options';
import { User } from '../entities/User';
import { UserFeed } from '../entities/UserFeed';
import { auth } from '../middlewares/auth';
import { NormalizeAndValidateArgs } from '../middlewares/normalize-validate-args';
import { MyContext, ReqWithSession, Role } from '../types';
import { ArgumentError } from './common/ArgumentError';
import { getUserFeeds } from './common/getUserFeeds';
import { EmailPasswordInput, OptionsInput, UserInfoInput } from './common/inputs';

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
@ObjectType()
class OptionsResponse {
    @Field(() => [ArgumentError], { nullable: true })
    errors?: ArgumentError[];

    @Field(() => Options, { nullable: true })
    options?: Options;
}

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => [UserFeed])
    async feeds(@Root() root: User) {
        if (!root.id) return null;
        return getUserFeeds(root.id);
    }

    @UseMiddleware(auth(Role.ADMIN))
    @Query(() => [User], { nullable: true })
    users() {
        return User.find();
    }

    @UseMiddleware(auth())
    @Query(() => User, { nullable: true })
    async me(@Ctx() { req }: MyContext) {
        if (!req.session.userId) {
            return null;
        }
        return User.findOne(req.session.userId);
    }

    @UseMiddleware(auth())
    @Query(() => Options)
    async myOptions(@Ctx() { req }: MyContext) {
        return Options.findOne({ where: { userId: req.session.userId } });
    }

    @NormalizeAndValidateArgs([EmailPasswordInput, 'input'], [UserInfoInput, 'userInfo'])
    @Mutation(() => UserResponse)
    async register(
        @Arg('input') input: EmailPasswordInput,
        @Arg('userInfo', { nullable: true }) userInfo: UserInfoInput,
        @Ctx() { req }: MyContext,
    ) {
        const { password: plainPassword, email } = input;
        const { locale, timeZone } = userInfo || {};
        const password = await argon2.hash(plainPassword);
        let user: User | undefined;
        try {
            user = await getConnection()
                .manager.create(User, {
                    email,
                    password,
                    locale,
                    timeZone,
                    options: new Options(),
                })
                .save();
        } catch (err) {
            if (err.code === '23505') {
                return { errors: [new ArgumentError('email', 'User already exists')] };
            }
        }
        if (!user) return null;
        setSession(req, user.id, user.role);

        return { user };
    }

    @NormalizeAndValidateArgs([EmailPasswordInput, 'input'])
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

    @UseMiddleware(auth())
    @NormalizeAndValidateArgs([UserInfoInput, 'userInfo'])
    @Mutation(() => User)
    async updateUserInfo(
        @Ctx() { req }: MyContext,
        @Arg('userInfo') { locale, timeZone }: UserInfoInput,
    ) {
        const user = await User.findOne(req.session.userId);
        if (!req.session.userId || !user) return null;
        if (locale) user.locale = locale;
        if (timeZone) user.timeZone = timeZone;
        return user.save();
    }

    @NormalizeAndValidateArgs([OptionsInput, 'opts'])
    @UseMiddleware(auth())
    @Mutation(() => OptionsResponse)
    async setOptions(@Ctx() { req }: MyContext, @Arg('opts') opts: OptionsInput) {
        const result = await getConnection()
            .createQueryBuilder()
            .update(Options)
            .set({ ...opts })
            .where('userId = :id', { id: req.session.userId })
            .returning('*')
            .execute();
        return { options: result.raw[0] as Options };
    }
}
