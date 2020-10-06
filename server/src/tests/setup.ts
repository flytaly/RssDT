/* eslint-disable no-underscore-dangle */
import dotenv from 'dotenv-safe';
import express from 'express';
import { Connection } from 'typeorm';
import { Server } from 'http';
import { initApolloServer } from '../apollo';
import { initDbConnection } from '../dbConnection';

export type MyGlobal = typeof global & {
    __dbConnection: Connection;
    __server: Server;
};

module.exports = async () => {
    dotenv.config({ path: '.env.testing' });

    const { PORT } = process.env;

    const app = express();
    const dbcon = await initDbConnection();
    await initApolloServer(app);

    const server = app.listen(PORT, () => {
        console.log(`start server on port:${PORT} for testing`);
    });

    (global as MyGlobal).__dbConnection = dbcon;
    (global as MyGlobal).__server = server;
};
