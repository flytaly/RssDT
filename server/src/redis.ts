import { Redis, RedisOptions } from 'ioredis';
import redisMock from 'ioredis-mock';
import { IS_TEST } from './constants.js';

export const createRedis = (opts: RedisOptions = {}): Redis => {
  if (IS_TEST) {
    return new redisMock(process.env.REDIS_URL, opts);
  }
  return new Redis(process.env.REDIS_URL, opts);
};

export const redis = createRedis();
