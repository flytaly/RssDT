import { MyGlobal } from './_setup.js';

const myGlobal = global as MyGlobal;

const closeServer = () =>
  new Promise<void>((resolve) => {
    myGlobal.__server.close(() => {
      resolve();
    });
  });

module.exports = async () => {
  await myGlobal.__dbConnection.close();
  myGlobal.__mailserver.close(() => console.log('stops the smtp server'));
  await closeServer();
  console.log('🏁 shut down server after tests');
};
