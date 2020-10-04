import 'reflect-metadata';
import 'dotenv-safe/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { TestResolver } from './resolvers/testResolver';
import { initDbConnection } from './dbConnection';

const entry = async () => {
    const app = express();

    await initDbConnection();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [TestResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res }),
    });

    apolloServer.applyMiddleware({ app });

    app.listen(process.env.PORT, () => {
        console.log(`server started on localhost:${process.env.PORT}`);
    });
};

entry().catch((err) => console.error(err));
