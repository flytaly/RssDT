import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import { Redis } from 'ioredis';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';
import { normalizeInput } from './middlewares/normalizeInputs';
import { MyContext, ReqWithSession } from './types';
import { UserFeedResolver } from './resolvers/userFeed';

export const initApolloServer = async (app: Express, redis: Redis) => {
    const schema = await buildSchema({
        resolvers: [UserResolver, UserFeedResolver],
        validate: false,
        globalMiddlewares: [normalizeInput],
    });

    const apolloServer = new ApolloServer({
        schema,
        context: ({ req, res }): MyContext => ({
            req: req as ReqWithSession,
            res,
            redis,
        }),
    });

    apolloServer.applyMiddleware({ app });

    return apolloServer;
};
