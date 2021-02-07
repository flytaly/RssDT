import { MiddlewareFn } from 'type-graphql';
import { IS_TEST } from '../constants';
import { MyContext } from '../types/index';

const ONE_DAY = 60 * 60 * 24;

export const rateLimit: (limit?: number, seconds?: number) => MiddlewareFn<MyContext> = (
  limit = 50,
  seconds = ONE_DAY,
) => async ({ context: { req, res, redis }, info }, next) => {
  if (IS_TEST) return next();

  const key = `rate-limit:${info.fieldName}:${req.session.userId || req.ip}`;
  const current = await redis.incr(key);
  if (current > limit) {
    res.status(429);
    throw new Error('Too Many Requests');
  } else if (current === 1) {
    await redis.expire(key, seconds);
  }

  return next();
};
