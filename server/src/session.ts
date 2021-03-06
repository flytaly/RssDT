import { Express } from 'express';
import session from 'express-session';
import connectRedis from 'connect-redis';
import Redis from 'ioredis';
import { COOKIE_NAME, IS_PROD } from './constants';

export const initSession = (app: Express, redis: Redis.Redis) => {
  const RedisStore = connectRedis(session);
  app.use(
    session({
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      secret: process.env.COOKIE_SECRET,
      resave: false,
      name: COOKIE_NAME,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 5, // 5 years
        httpOnly: IS_PROD,
        sameSite: IS_PROD ? 'lax' : 'none', // csrf
        secure: IS_PROD,
      },
    }),
  );
};
