import 'reflect-metadata';
import 'dotenv-safe/config';
import express from 'express';
import { initDbConnection } from './dbConnection';
import { initApolloServer } from './apollo';

const entry = async () => {
    const app = express();

    await initDbConnection();
    await initApolloServer(app);

    app.listen(process.env.PORT, () => {
        console.log(`server started on localhost:${process.env.PORT}`);
    });
};

entry().catch((err) => console.error(err));
