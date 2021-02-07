import ioRedis from 'ioredis';
import { IS_TEST } from './constants';

let Redis = ioRedis;

if (IS_TEST) {
  // eslint-disable-next-line global-require
  Redis = require('ioredis-mock');
}

export const redis = new Redis();
