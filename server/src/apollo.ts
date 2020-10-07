import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';

export const initApolloServer = async (app: Express) => {
    const schema = await buildSchema({
        resolvers: [UserResolver],
        validate: false,
    });

    const apolloServer = new ApolloServer({
        schema,
        context: ({ req, res }) => ({ req, res }),
    });

    apolloServer.applyMiddleware({ app });

    return apolloServer;
};
