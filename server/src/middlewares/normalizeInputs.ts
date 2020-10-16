/* eslint-disable no-param-reassign */
import { MiddlewareFn } from 'type-graphql';
import normalizeUrl from 'normalize-url';

export const normalizeInput: MiddlewareFn = async (resolve, next) => {
    const { args } = resolve;
    if (args.email) {
        args.email = args.email.trim().toLowerCase();
    }
    if (args.password) {
        args.password = args.password.trim();
    }
    if (args.feedUrl) {
        try {
            args.feedUrl = normalizeUrl(args.feedUrl);
        } catch (e) {
            args.feedUrl = '';
        }
    }
    return next();
};
