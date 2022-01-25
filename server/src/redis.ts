import ioRedis from 'ioredis';
import redisMock from 'ioredis-mock';
import { IS_TEST } from './constants.js';

const Redis  = !IS_TEST ? ioRedis : redisMock;

// if (IS_TEST) {
// eslint-disable-next-line global-require
// Redis = require('ioredis-mock');
// }

export const createRedis = (opts: ioRedis.RedisOptions = {}): ioRedis.Redis =>
  new Redis(process.env.REDIS_URL, opts);

export const redis = createRedis();
