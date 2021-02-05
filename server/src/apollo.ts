import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import { Redis } from 'ioredis';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';
import { MyContext, ReqWithSession } from './types';
import { UserFeedResolver } from './resolvers/userFeed';
import { FeedResolver } from './resolvers/feed';
import { createItemCountLoader } from './utils/createItemCountLoader';

export const initApolloServer = async (app: Express, redis: Redis) => {
  const schema = await buildSchema({
    resolvers: [UserResolver, UserFeedResolver, FeedResolver],
    validate: false,
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }): MyContext => ({
      req: req as ReqWithSession,
      res,
      redis,
      itemCountLoader: createItemCountLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: { origin: process.env.FRONTEND_URL } });

  return apolloServer;
};
