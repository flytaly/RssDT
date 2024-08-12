import '#root/dotenv.js';
import 'reflect-metadata';

import MailDev from 'maildev';

import { initApolloServer } from '#root/apollo.js';

const startMail = (debug = false) => {
  const maildev = new MailDev({
    smtp: +process.env.MAIL_PORT,
    web: 3434,
    silent: !debug,
  });
  maildev.listen(() => {});
  return maildev as unknown as typeof maildev & {
    close: () => void;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let onClose: () => Promise<any>;

export async function startTestServer({ debug }: { debug?: boolean } = {}) {
  const { PORT } = process.env;

  const { apolloServer, httpServer } = await initApolloServer();
  httpServer.listen(PORT, () => {
    if (debug) console.log(`🚀 start server on port: ${PORT} for testing`);
  });

  httpServer.keepAliveTimeout = 0;
  httpServer.timeout = 1000;

  const maildev = startMail(debug);

  onClose = async () => {
    await apolloServer.stop();
    maildev.close();
    if (debug) console.log('connections closed');
  };
}

export async function stopTestServer() {
  return onClose();
}
