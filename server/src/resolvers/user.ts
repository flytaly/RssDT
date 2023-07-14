// eslint-disable-next-line import/extensions
import { Options, User, UserFeed } from '#entities';
import { users, options, NewOptions } from '#root/db/schema.js';
import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
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
import { COOKIE_NAME, EMAIL_CONFIRM_PREFIX, PASSWORD_RESET_PREFIX } from '../constants.js';
import { logger } from '../logger.js';
import { auth } from '../middlewares/auth.js';
import { NormalizeAndValidateArgs } from '../middlewares/normalize-validate-args.js';
import { rateLimit } from '../middlewares/rate-limit.js';
import { MyContext, ReqWithSession, Role } from '../types/index.js';
import { activateAllUserFeeds } from './queries/activateAllUserFeeds.js';
import { createUser } from './queries/createUser.js';
import { getUserFeeds } from './queries/getUserFeeds.js';
import { setUserDeleted } from './queries/setUserDeleted.js';
import { updateUser } from './queries/updateUser.js';
import { updateUserOptions } from './queries/updateUserOptions.js';
import { resetPasswordEmail, verificationEmail } from './resolver-types/confirmationMail.js';
import { ArgumentError } from './resolver-types/errors.js';
import {
  EmailPasswordInput,
  OptionsInput,
  PasswordResetInput,
  UserInfoInput,
} from './resolver-types/inputs.js';

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

@ObjectType()
class MessageResponse {
  @Field(() => String)
  message?: string;
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
  users(@Ctx() { db }: MyContext) {
    return db.query.users.findMany();
  }

  @UseMiddleware(auth())
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, db }: MyContext) {
    if (!req.session.userId) return null;
    const userList = await db.query.users.findMany({
      with: { options: true },
      where: eq(users.id, req.session.userId),
    });
    if (userList[0]?.deleted) return null;
    return userList[0];
  }

  @UseMiddleware(auth())
  @Query(() => Options)
  async myOptions(@Ctx() { req, db }: MyContext) {
    const { userId } = req.session;

    const optsList = await db.query.options.findMany({
      where: eq(options.userId, userId),
    });

    if (optsList[0]) return optsList[0];

    const newOpts: NewOptions = { userId };
    const insertedOpts = await db.insert(options).values(newOpts).returning();
    return insertedOpts[0]!;
  }

  @UseMiddleware(rateLimit(10, 60 * 60))
  @NormalizeAndValidateArgs([EmailPasswordInput, 'input'], [UserInfoInput, 'userInfo'])
  @Mutation(() => UserResponse)
  async register(
    @Arg('input') input: EmailPasswordInput,
    @Arg('userInfo', { nullable: true }) userInfo: UserInfoInput,
    @Ctx() { req, redis, db }: MyContext,
  ) {
    const { password: plainPassword, email } = input;
    const password = await argon2.hash(plainPassword);
    const { error, user } = await createUser(db, {
      ...(userInfo || {}),
      password,
      email,
    });
    if (error) return { errors: [error] };
    if (!user) return null;
    setSession(req, user.id, user.role);

    await verificationEmail(redis, user.id, email);
    return { user };
  }

  @UseMiddleware(auth(), rateLimit(3, 60))
  @Mutation(() => Boolean)
  async requestEmailVerification(@Ctx() { redis, req, db }: MyContext) {
    const userList = await db.select().from(users).where(eq(users.id, req.session.userId));
    const user = userList[0];
    if (!user) return false;
    await verificationEmail(redis, user.id, user.email);
    return true;
  }

  @UseMiddleware(rateLimit(3, 60))
  @Mutation(() => MessageResponse)
  async requestPasswordReset(@Arg('email') email: string, @Ctx() { redis, db }: MyContext) {
    const selected = await db.select().from(users).where(eq(users.email, email));
    const user = selected[0];
    if (!user) return { message: "User doesn't exist" };
    await resetPasswordEmail(redis, user.id, user.email);
    return { message: 'OK' };
  }

  @UseMiddleware(rateLimit(3, 60))
  @NormalizeAndValidateArgs([PasswordResetInput, 'input'])
  @Mutation(() => UserResponse)
  async resetPassword(
    @Ctx() { redis, req, db }: MyContext,
    @Arg('input') { userId, token, password: plainPassword }: PasswordResetInput,
  ) {
    const key = PASSWORD_RESET_PREFIX + token;
    const id = await redis.get(key);
    if (!id || id !== userId) {
      return { errors: [new ArgumentError('token', 'wrong or expired token')] };
    }

    const password = await argon2.hash(plainPassword);
    const { user } = await updateUser(db, parseInt(userId), {
      password,
      emailVerified: true,
      deleted: false,
    });

    await redis.del(key);
    setSession(req, user.id, user.role);
    await activateAllUserFeeds(user.id);
    return { user };
  }

  @Mutation(() => UserResponse)
  async verifyEmail(
    @Ctx() { redis, db }: MyContext,
    @Arg('token') token: string,
    @Arg('userId') userId: string,
  ) {
    const key = EMAIL_CONFIRM_PREFIX + token;
    const id = await redis.get(key);
    if (!id || id !== userId) {
      return { errors: [new ArgumentError('token', 'wrong or expired token')] };
    }
    await redis.del(key);
    const userIdInt = parseInt(userId);
    await activateAllUserFeeds(userIdInt);
    return updateUser(db, userIdInt, { emailVerified: true });
  }

  @UseMiddleware(rateLimit(3, 2))
  @NormalizeAndValidateArgs([EmailPasswordInput, 'input'])
  @Mutation(() => UserResponse)
  async login(@Arg('input') input: EmailPasswordInput, @Ctx() { req, db }: MyContext) {
    const { password: plainPassword, email } = input;
    const userList = await db.select().from(users).where(eq(users.email, email));
    const user = userList[0];
    if (!user || user.deleted) {
      return { errors: [new ArgumentError('email', "User with such email doesn't exist")] };
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
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((error) => {
        res.clearCookie(COOKIE_NAME);
        if (error) {
          logger.error(error);
          resolve(error);
          return;
        }
        resolve(true);
      }),
    );
  }

  @UseMiddleware(auth())
  @NormalizeAndValidateArgs([UserInfoInput, 'userInfo'])
  @Mutation(() => User)
  async updateUserInfo(
    @Ctx() { req, db }: MyContext,
    @Arg('userInfo') { locale, timeZone }: UserInfoInput,
  ) {
    if (!req.session.userId) return null;
    const { user } = await updateUser(db, req.session.userId, {
      locale: locale || undefined,
      timeZone: timeZone || undefined,
    });
    return user;
  }

  @UseMiddleware(auth())
  @NormalizeAndValidateArgs([OptionsInput, 'opts'])
  @Mutation(() => OptionsResponse)
  async setOptions(@Ctx() { req, db }: MyContext, @Arg('opts') opts: OptionsInput) {
    return updateUserOptions(db, req.session.userId, opts);
  }

  @UseMiddleware(auth())
  @Mutation(() => MessageResponse)
  async deleteUser(@Ctx() { req, res, db }: MyContext) {
    const msg = await setUserDeleted(db, req.session.userId);

    await new Promise((resolve) =>
      req.session.destroy(() => resolve(res.clearCookie(COOKIE_NAME))),
    );

    return { message: msg || 'OK' };
  }
}
