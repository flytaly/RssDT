import { db } from '#root/db/db.js';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import { GraphQLScalarType } from 'graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from 'ioredis';
import { buildSchema } from 'type-graphql';
import { WatcherQueue } from './feed-watcher/watcher.queue.js';
import { createRedis } from './redis.js';
import { FeedResolver } from './resolvers/feed.js';
import { MailResolver } from './resolvers/mail.js';
import { UserResolver } from './resolvers/user.js';
import { UserFeedResolver } from './resolvers/userFeed.js';
import { MyContext, ReqWithSession } from './types/index.js';
import { createItemCountLoader } from './utils/createItemCountLoader.js';

/**
 * Fix "unable to serialize value as it's not an instance of 'date'" error.
 * This error occurs when selecting from the database with raw SQL queries
 * without proper mapping afterwards.
 * If given Date is a string then just return it as it is.
 */
export const DateTimeFix = new GraphQLScalarType({
  name: 'DateTimeFix',
  description:
    'The javascript `Date` as string. Type represents date and time as the ISO Date string.',
  serialize(value: string | Date) {
    if (typeof value === 'string' && Date.parse(value) !== NaN) {
      return value;
    }
    if (!(value instanceof Date)) {
      throw new Error(`Unable to serialize value '${value}' as it's not an instance of 'Date'`);
    }
    return value.toISOString();
  },
});

export const initApolloServer = async (app: Express, redis: Redis) => {
  const pubsub = new RedisPubSub({
    publisher: createRedis(),
    subscriber: createRedis(),
  });

  const schema = await buildSchema({
    resolvers: [UserResolver, UserFeedResolver, FeedResolver, MailResolver],
    validate: false,
    pubSub: pubsub,
    scalarsMap: [{ type: Date, scalar: DateTimeFix }],
  });

  const watcherQueue = new WatcherQueue();

  const apolloServer = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: ({ req, res }): MyContext => {
      return {
        req: req as ReqWithSession,
        res,
        redis,
        itemCountLoader: createItemCountLoader(),
        pubsub,
        watcherQueue,
        db,
      };
    },
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  });

  return { apolloServer, pubsub, schema };
};
