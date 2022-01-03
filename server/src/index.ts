import 'reflect-metadata';
import './dotenv.js';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { initDbConnection } from './dbConnection.js';
import { initApolloServer } from './apollo.js';
import { initSession } from './session.js';
import { logger, initLogFiles } from './logger.js';
import { redis } from './redis.js';
import { importNormalizer } from './utils/normalizer.js';

const entry = async () => {
  const app = express();

  app.set('trust proxy', 1);
  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

  await importNormalizer();
  const sessionMiddleware = initSession(app, redis);
  const dbConnection = await initDbConnection();
  const { apolloServer, pubsub } = await initApolloServer(app, redis, sessionMiddleware);
  initLogFiles({ prefix: 'api_', name: 'api' });

  const httpServer = http.createServer(app);
  apolloServer.installSubscriptionHandlers(httpServer);

  httpServer.listen(process.env.PORT, () => {
    logger.info(`server started on localhost:${process.env.PORT}`);
  });

  const exit = async () => {
    await dbConnection.close();
    await pubsub.close();
    await apolloServer.stop();
    process.exit();
  };

  // catches ctrl+c event
  process.on('SIGINT', exit);
  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exit);
  process.on('SIGUSR2', exit);
};

entry().catch((err) => console.error(err));
