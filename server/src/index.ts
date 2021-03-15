import 'reflect-metadata';
import './dotenv';
import express from 'express';
import cors from 'cors';
import { PubSub } from 'apollo-server-express';
import { initDbConnection } from './dbConnection';
import { initApolloServer } from './apollo';
import { initSession } from './session';
import { logger, initLogFiles } from './logger';
import { redis } from './redis';

const http = require('http');

const entry = async () => {
  const app = express();

  app.set('trust proxy', 1);
  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

  const sessionMiddleware = initSession(app, redis);
  await initDbConnection();
  const apolloServer = await initApolloServer(app, redis, sessionMiddleware);
  initLogFiles({ prefix: 'api_', name: 'api' });

  const httpServer = http.createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  httpServer.listen(process.env.PORT, () => {
    logger.info(`server started on localhost:${process.env.PORT}`);
  });
};

entry().catch((err) => console.error(err));
