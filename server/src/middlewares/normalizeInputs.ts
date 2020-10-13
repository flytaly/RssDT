/* eslint-disable no-param-reassign */
import { MiddlewareFn } from 'type-graphql';

export const normalizeInput: MiddlewareFn = async (resolve, next) => {
    const { args } = resolve;
    if (args.email) {
        args.email = args.email.trim().toLowerCase();
    }
    if (args.password) {
        args.password = args.password.trim();
    }
    return next();
};
