import ioRedis from 'ioredis';
import { IS_TEST } from './constants.js';

let Redis = ioRedis;

if (IS_TEST) {
  // eslint-disable-next-line global-require
  Redis = require('ioredis-mock');
}

export const redisOptions: ioRedis.RedisOptions = {
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
};

export const createRedis = () => new Redis(redisOptions);
export const redis = createRedis();
