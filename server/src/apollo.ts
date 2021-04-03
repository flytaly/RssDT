import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import session from 'express-session';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from 'ioredis';
import { buildSchema } from 'type-graphql';
import { createRedis, redisOptions } from './redis.js';
import { FeedResolver } from './resolvers/feed.js';
import { MailResolver } from './resolvers/mail.js';
import { UserResolver } from './resolvers/user.js';
import { UserFeedResolver } from './resolvers/userFeed.js';
import { MyContext, ReqWithSession } from './types/index.js';
import { createItemCountLoader } from './utils/createItemCountLoader.js';

export const initApolloServer = async (
  app: Express,
  redis: Redis,
  sessionMiddleware: ReturnType<typeof session>,
) => {
  const pubsub = new RedisPubSub({
    publisher: createRedis(),
    subscriber: createRedis(),
    connection: redisOptions,
  });
  const schema = await buildSchema({
    resolvers: [UserResolver, UserFeedResolver, FeedResolver, MailResolver],
    validate: false,
    pubSub: pubsub,
  });

  const apolloServer = new ApolloServer({
    schema,
    subscriptions: {
      onConnect: (_, ws) => {
        const req = (ws as any).upgradeReq as ReqWithSession;
        sessionMiddleware(req as any, {} as any, () => {
          if (!req?.session?.userId) {
            throw new Error('Not authenticated');
          }
        });
        return { req }; // pass req in the connection's context
      },
    },
    context: ({ req, res, connection }): MyContext => {
      const wsRequest = connection?.context.req;
      return {
        req: (req || wsRequest) as ReqWithSession,
        res,
        redis,
        itemCountLoader: createItemCountLoader(),
        pubsub,
      };
    },
  });
  apolloServer.applyMiddleware({ app, cors: { origin: process.env.FRONTEND_URL } });

  return { apolloServer, pubsub };
};
