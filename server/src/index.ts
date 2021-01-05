import 'reflect-metadata';
import './dotenv';
import express from 'express';
import Redis from 'ioredis';
import cors from 'cors';
import { initDbConnection } from './dbConnection';
import { initApolloServer } from './apollo';
import { initSession } from './session';
import { logger, initLogFiles } from './logger';

const entry = async () => {
    const app = express();
    app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

    const redis = new Redis();
    initSession(app, redis);
    await initDbConnection();
    await initApolloServer(app, redis);
    initLogFiles('server_');

    app.listen(process.env.PORT, () => {
        logger.info(`server started on localhost:${process.env.PORT}`);
    });
};

entry().catch((err) => console.error(err));
