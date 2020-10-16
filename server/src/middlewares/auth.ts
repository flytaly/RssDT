import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';
import { Role } from '../entities/User';
import { MyContext } from '../types';

export const auth = (role = Role.USER): MiddlewareFn<MyContext> => ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new AuthenticationError('not authenticated');
    }

    if (role === Role.ADMIN && context.req.session.role !== Role.ADMIN) {
        throw new ForbiddenError('forbidden');
    }

    return next();
};
