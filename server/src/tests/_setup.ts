/* eslint-disable no-underscore-dangle */
import '../dotenv';
import express from 'express';
import { Connection } from 'typeorm';
import { Server } from 'http';
import MailDev from 'maildev';
import { initApolloServer } from '../apollo';
import { initDbConnection } from '../dbConnection';
import { initSession } from '../session';
import { redis } from '../redis';

export type MyGlobal = typeof global & {
  __dbConnection: Connection;
  __server: Server;
  __mailserver: { close: Function };
};

const startMail = () => {
  const maildev = new MailDev({
    smtp: +process.env.MAIL_PORT,
    web: 3434,
  });
  maildev.listen();
  // maildev has wrong TS types
  (global as MyGlobal).__mailserver = (maildev as unknown) as { close: Function };
};

module.exports = async () => {
  const { PORT } = process.env;

  const app = express();
  const dbcon = await initDbConnection();

  initSession(app, redis);
  // Connection.da
  await initApolloServer(app, redis);
  const server = app.listen(PORT, () => {
    console.log(`🚀 start server on port:${PORT} for testing`);
  });

  server.keepAliveTimeout = 0;
  server.timeout = 1000;

  startMail();

  (global as MyGlobal).__dbConnection = dbcon;
  (global as MyGlobal).__server = server;
};
