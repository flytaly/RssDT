import 'reflect-metadata';
import 'dotenv-safe/config';
import express from 'express';
import Redis from 'ioredis';
import { initDbConnection } from './dbConnection';
import { initApolloServer } from './apollo';
import { initSession } from './session';

const entry = async () => {
    const app = express();

    const redis = new Redis();
    initSession(app, redis);
    await initDbConnection();
    await initApolloServer(app, redis);

    app.listen(process.env.PORT, () => {
        console.log(`server started on localhost:${process.env.PORT}`);
    });
};

entry().catch((err) => console.error(err));
