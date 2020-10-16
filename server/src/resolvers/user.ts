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
import { Role, User } from '../entities/User';
import { UserFeed } from '../entities/UserFeed';
import { auth } from '../middlewares/auth';
import { MyContext, ReqWithSession } from '../types';
import { FieldError } from './common/FieldError';

const setSession = (req: ReqWithSession, userId: number, role = Role.USER) => {
    req.session.userId = userId;
    req.session.role = role;
};

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => [UserFeed])
    async feeds(@Root() root: User) {
        // TODO: use dataloader
        if (!root.id) return null;
        return UserFeed.find({ where: { userId: root.id } });
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
        setSession(req, user.id, user.role);

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
            return { errors: [{ field: 'email', message: "User with such email doesn't exist" }] };
        }

        const isMatch =
            user.password && // password could be empty
            (await argon2.verify(user.password, plainPassword));
        if (!isMatch) {
            return { errors: [{ field: 'password', message: 'Wrong password' }] };
        }

        setSession(req, user.id, user.role);

        return { user };
    }
}
