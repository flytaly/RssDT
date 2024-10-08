// ! __reflect-metadata__ and __dotenv__ imports have to stay at the top
import 'reflect-metadata';
import './dotenv.js';

import { initApolloServer } from './apollo.js';
import { initLogFiles, logger } from './logger.js';
import { initWSServer } from './ws-server.js';

const entry = async () => {
  /* await migrateDB(); */

  initLogFiles({ prefix: 'api_', name: 'api' });

  const { apolloServer, schema, httpServer, sessionMiddleware } = await initApolloServer();

  httpServer.listen(process.env.PORT, () => {
    logger.info(`server started on localhost:${process.env.PORT}`);
  });

  const wsCleanup = initWSServer({ schema, sessionMiddleware, server: httpServer });

  const exit = async () => {
    await apolloServer.stop();
    await wsCleanup.dispose();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.exit();
  };

  // catches ctrl+c event
  process.on('SIGINT', exit);
  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exit);
  process.on('SIGUSR2', exit);
};

entry().catch((err) => console.error(err));
