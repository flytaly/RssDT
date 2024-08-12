import { GraphQLError } from 'graphql';
import { MiddlewareFn } from 'type-graphql';

import { MyContext, Role } from '../types/index.js';

export const auth =
  (role = Role.USER): MiddlewareFn<MyContext> =>
  ({ context }, next) => {
    if (!context.req.session.userId) {
      throw new GraphQLError('not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    if (role === Role.ADMIN && context.req.session.role !== Role.ADMIN) {
      throw new GraphQLError('forbidden', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return next();
  };
