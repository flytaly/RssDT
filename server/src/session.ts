import { Express } from 'express';
import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import { COOKIE_NAME, IS_PROD } from './constants.js';

export const initSession = (app: Express, redis: Redis) => {
  const sessionMiddleware = session({
    store: new RedisStore({
      client: redis,
      disableTouch: true,
    }),
    secret: process.env.COOKIE_SECRET!,
    resave: false,
    name: COOKIE_NAME,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 5, // 5 years
      httpOnly: IS_PROD,
      sameSite: 'lax', // csrf
      secure: IS_PROD,
    },
  });
  app.use(sessionMiddleware);
  return sessionMiddleware;
};
