import { createRedisEventTarget } from '@graphql-yoga/redis-event-target';
import { createPubSub } from '@graphql-yoga/subscription';
import { Redis, RedisOptions } from 'ioredis';
import redisMock from 'ioredis-mock';
import { IS_TEST } from './constants.js';
import { NewItemsPayload, PubSubTopics } from './resolvers/resolver-types/pubSubTopics.js';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL env variable is not defined');
}

export const createRedis = (opts: RedisOptions = {}): Redis => {
  if (IS_TEST) {
    return new redisMock(redisUrl, opts);
  }
  return new Redis(redisUrl, opts);
};

export const redis = createRedis();

export const pubSub = createPubSub<{
  [PubSubTopics.newItems]: [NewItemsPayload];
}>({
  eventTarget: createRedisEventTarget({
    publishClient: new Redis(redisUrl, {
      retryStrategy: (times) => Math.max(times * 100, 3000),
    }),
    subscribeClient: new Redis(redisUrl, {
      retryStrategy: (times) => Math.max(times * 100, 3000),
    }),
  }),
});
