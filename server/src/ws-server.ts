import session from 'express-session';
import { getOperationAST, GraphQLError, GraphQLSchema, parse, validate } from 'graphql';
import { SubscribeMessage } from 'graphql-ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import http from 'http';
import { WebSocketServer } from 'ws'; // yarn add ws
import { ReqWithSession, WSContext } from './types/index.js';

interface WSServerArgs {
  server: http.Server;
  schema: GraphQLSchema;
  sessionMiddleware: ReturnType<typeof session>;
}

/**
 *  `graphql-ws` currently isn't supported by Graphql Playground, but it's possible
 *  to add `subscriptions-transport-ws` if nessesary. Look at "ws server usage
 *  with subscriptions-transport-ws backwards compatibility" recipe in the README
 *  of the project.
 */
export function initWSServer({ schema, sessionMiddleware, server }: WSServerArgs) {
  const graphqlWs = new WebSocketServer({ server, path: '/graphql' });

  useServer(
    {
      schema,

      context: ({ extra }) => ({ req: extra.request } as WSContext),

      onConnect: ({ extra }) => {
        sessionMiddleware(extra.request as any, {} as any, () => {});
      },

      onSubscribe: async (ctx, msg) => {
        const req = ctx.extra.request as ReqWithSession;
        if (!req?.session?.userId) {
          throw new Error('Not authenticated');
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return allowOnlySub(schema, msg);
      },
    },
    graphqlWs,
  );

  return graphqlWs;
}

/**
 * Accept only subscription operations
 * Code from graphql-ws recipes:
 * https://github.com/enisdenjo/graphql-ws/blob/master/README.md#recipes
 */
function allowOnlySub(schema: GraphQLSchema, msg: SubscribeMessage) {
  // construct the execution arguments
  const args = {
    schema,
    operationName: msg.payload.operationName,
    document: parse(msg.payload.query),
    variableValues: msg.payload.variables,
  };

  const operationAST = getOperationAST(args.document, args.operationName);
  if (!operationAST) {
    // returning `GraphQLError[]` sends an `ErrorMessage` and stops the subscription
    return [new GraphQLError('Unable to identify operation')];
  }

  // handle mutation and query requests
  if (operationAST.operation !== 'subscription') {
    // returning `GraphQLError[]` sends an `ErrorMessage` and stops the subscription
    // return [new GraphQLError('Only subscription operations are supported')];

    // or if you want to be strict and terminate the connection on illegal operations
    throw new Error('Only subscription operations are supported');
  }

  // dont forget to validate
  const errors = validate(args.schema, args.document);
  if (errors.length > 0) {
    // returning `GraphQLError[]` sends an `ErrorMessage` and stops the subscription
    return errors;
  }

  // ready execution arguments
  return args;
}
