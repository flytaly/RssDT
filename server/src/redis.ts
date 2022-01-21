import ioRedis from 'ioredis';
import redisMock from 'ioredis-mock';
import { IS_TEST, redisOptions } from './constants.js';

const Redis = !IS_TEST ? ioRedis : redisMock;

// if (IS_TEST) {
// eslint-disable-next-line global-require
// Redis = require('ioredis-mock');
// }

export const createRedis = (opts: ioRedis.RedisOptions = {}) =>
  new Redis({ redisOptions, ...opts });

export const redis = createRedis();
