import '#root/dotenv.js';
import 'reflect-metadata';

import { initApolloServer } from '#root/apollo.js';
import { initDbConnection } from '#root/dbConnection.js';
import { redis } from '#root/redis.js';
import { initSession } from '#root/session.js';
import { importNormalizer } from '#root/utils/normalizer.js';
import express from 'express';
import MailDev from 'maildev';

const startMail = (debug = false) => {
  const maildev = new MailDev({
    smtp: +process.env.MAIL_PORT,
    web: 3434,
    silent: !debug,
  });
  maildev.listen(() => {});
  return maildev as unknown as typeof maildev & {
    close: Function;
  };
};

let onClose: () => Promise<any>;

export async function startTestServer({ debug }: { debug?: boolean } = {}) {
  const { PORT } = process.env;

  const app = express();

  await importNormalizer();
  /* const sessionMiddleware =  */ initSession(app, redis);
  const dbConnection = await initDbConnection(debug);
  const { apolloServer, pubsub } = await initApolloServer(app, redis);
  const server = app.listen(PORT, () => {
    if (debug) console.log(`🚀 start server on port: ${PORT} for testing`);
  });

  server.keepAliveTimeout = 0;
  server.timeout = 1000;

  const maildev = startMail(debug);

  onClose = async () => {
    await dbConnection.close();
    await pubsub.close();
    await apolloServer.stop();
    maildev.close();
    if (debug) console.log('connections closed');
  };
}

export async function stopTestServer() {
  return onClose();
}
