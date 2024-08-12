import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import express from 'express';
import { GraphQLScalarType } from 'graphql';
import http from 'http';
import { buildSchema } from 'type-graphql';

import { db } from '#root/db/db.js';
import { WatcherQueue } from './feed-watcher/watcher.queue.js';
import { pubSub, redis } from './redis.js';
import { FeedResolver } from './resolvers/feed.js';
import { MailResolver } from './resolvers/mail.js';
import { UserResolver } from './resolvers/user.js';
import { UserFeedResolver } from './resolvers/userFeed.js';
import { initSession } from './session.js';
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
  serialize(value: unknown) {
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return value;
    }
    if (!(value instanceof Date)) {
      throw new Error(`Unable to serialize value '${value}' as it's not an instance of 'Date'`);
    }
    return value.toISOString();
  },
});

export const initApolloServer = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver, UserFeedResolver, FeedResolver, MailResolver],
    validate: false,
    pubSub: pubSub,
    scalarsMap: [{ type: Date, scalar: DateTimeFix }],
  });

  const app = express();
  app.set('trust proxy', 1);
  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
  const sessionMiddleware = initSession(app, redis);

  // Our httpServer handles incoming requests to our Express app.
  // Below, we tell Apollo Server to "drain" this httpServer,
  // enabling our servers to shut down gracefully.
  const httpServer = http.createServer(app);

  const apolloServer = new ApolloServer<MyContext>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Ensure we wait for our server to start
  await apolloServer.start();

  const watcherQueue = new WatcherQueue();
  // Set up our Express middleware to handle CORS, body parsing,
  // and our expressMiddleware function.
  app.use(
    '/',
    cors<cors.CorsRequest>({ origin: process.env.FRONTEND_URL, credentials: true }),
    express.json(),
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(apolloServer, {
      context: async ({ req, res }): Promise<MyContext> => {
        return {
          req: req as ReqWithSession,
          res,
          redis,
          itemCountLoader: createItemCountLoader(),
          pubsub: pubSub,
          watcherQueue,
          db,
        };
      },
    }),
  );

  return { apolloServer, schema, sessionMiddleware, httpServer };
};
