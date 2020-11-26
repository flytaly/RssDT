import { MyGlobal } from './_setup';

const myGlobal = global as MyGlobal;

const closeServer = () =>
    new Promise<void>((resolve) => {
        myGlobal.__server.close(() => {
            resolve();
        });
    });

module.exports = async () => {
    await closeServer();
    await myGlobal.__dbConnection.close();
    console.log('🏁 shut down server after tests');
};
