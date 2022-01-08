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
// eslint-disable-next-line import/extensions
import { Options, User, UserFeed } from '#entities';

import { COOKIE_NAME, EMAIL_CONFIRM_PREFIX, PASSWORD_RESET_PREFIX } from '../constants.js';
import { logger } from '../logger.js';
import { auth } from '../middlewares/auth.js';
import { NormalizeAndValidateArgs } from '../middlewares/normalize-validate-args.js';
import { rateLimit } from '../middlewares/rate-limit.js';
import { MyContext, ReqWithSession, Role } from '../types/index.js';
import { activateAllUserFeeds } from './queries/activateAllUserFeeds.js';
import { createUser } from './queries/createUser.js';
import { getUserFeeds } from './queries/getUserFeeds.js';
import { updateUser } from './queries/updateUser.js';
import { updateUserOptions } from './queries/updateUserOptions.js';
import { ArgumentError } from './resolver-types/errors.js';
import { resetPasswordEmail, verificationEmail } from './resolver-types/confirmationMail.js';
import {
  EmailPasswordInput,
  OptionsInput,
  PasswordResetInput,
  UserInfoInput,
} from './resolver-types/inputs.js';
import { setUserDeleted } from './queries/setUserDeleted.js';

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
  users() {
    return User.find();
  }

  @UseMiddleware(auth())
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) return null;
    return User.findOne(req.session.userId);
  }

  @UseMiddleware(auth())
  @Query(() => Options)
  async myOptions(@Ctx() { req }: MyContext) {
    const { userId } = req.session;
    const result = await Options.findOne({ where: { userId } });
    if (!result) {
      const options = Options.create({ userId });
      options.save();
      return options;
    }
    return result;
  }

  @UseMiddleware(rateLimit(10, 60 * 60))
  @NormalizeAndValidateArgs([EmailPasswordInput, 'input'], [UserInfoInput, 'userInfo'])
  @Mutation(() => UserResponse)
  async register(
    @Arg('input') input: EmailPasswordInput,
    @Arg('userInfo', { nullable: true }) userInfo: UserInfoInput,
    @Ctx() { req, redis }: MyContext,
  ) {
    const { password: plainPassword, email } = input;
    const password = await argon2.hash(plainPassword);
    const { error, user } = await createUser({
      ...(userInfo || {}),
      password,
      email,
      options: Options.create(),
    });
    if (error) return { errors: [error] };
    if (!user) return null;
    setSession(req, user.id, user.role);

    await verificationEmail(redis, user.id, email);
    return { user };
  }

  @UseMiddleware(auth(), rateLimit(3, 60))
  @Mutation(() => Boolean)
  async requestEmailVerification(@Ctx() { redis, req }: MyContext) {
    const user = await User.findOne(req.session.userId);
    if (!user) return false;
    await verificationEmail(redis, user.id, user.email);
    return true;
  }

  @UseMiddleware(rateLimit(3, 60))
  @Mutation(() => MessageResponse)
  async requestPasswordReset(@Arg('email') email: string, @Ctx() { redis }: MyContext) {
    const user = await User.findOne({ where: { email } });
    if (!user) return { message: "User doesn't exist" };
    await resetPasswordEmail(redis, user.id, user.email);
    return { message: 'OK' };
  }

  @UseMiddleware(rateLimit(3, 60))
  @NormalizeAndValidateArgs([PasswordResetInput, 'input'])
  @Mutation(() => UserResponse)
  async resetPassword(
    @Ctx() { redis, req }: MyContext,
    @Arg('input') { userId, token, password: plainPassword }: PasswordResetInput,
  ) {
    const key = PASSWORD_RESET_PREFIX + token;
    const id = await redis.get(key);
    if (!id || id !== userId) {
      return { errors: [new ArgumentError('token', 'wrong or expired token')] };
    }

    const password = await argon2.hash(plainPassword);
    const { user } = await updateUser(parseInt(userId), { password, emailVerified: true });

    await redis.del(key);
    setSession(req, user.id, user.role);
    await activateAllUserFeeds(user.id);
    return { user };
  }

  @Mutation(() => UserResponse)
  async verifyEmail(
    @Ctx() { redis }: MyContext,
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
    return updateUser(userIdInt, { emailVerified: true });
  }

  @UseMiddleware(rateLimit(3, 2))
  @NormalizeAndValidateArgs([EmailPasswordInput, 'input'])
  @Mutation(() => UserResponse)
  async login(@Arg('input') input: EmailPasswordInput, @Ctx() { req }: MyContext) {
    const { password: plainPassword, email } = input;
    const user = await User.findOne({ where: { email } });
    if (!user) {
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
    @Ctx() { req }: MyContext,
    @Arg('userInfo') { locale, timeZone }: UserInfoInput,
  ) {
    const user = await User.findOne(req.session.userId);
    if (!req.session.userId || !user) return null;
    if (locale) user.locale = locale;
    if (timeZone) user.timeZone = timeZone;
    return user.save();
  }

  @UseMiddleware(auth())
  @NormalizeAndValidateArgs([OptionsInput, 'opts'])
  @Mutation(() => OptionsResponse)
  async setOptions(@Ctx() { req }: MyContext, @Arg('opts') opts: OptionsInput) {
    return updateUserOptions(req.session.userId, opts);
  }

  @UseMiddleware(auth())
  @Mutation(() => MessageResponse)
  async deleteUser(@Ctx() { req }: MyContext) {
    const msg = await setUserDeleted({ userId: req.session.userId });
    return { message: msg || 'OK' };
  }
}
