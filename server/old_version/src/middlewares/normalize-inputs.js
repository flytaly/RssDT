/* eslint-disable no-param-reassign */
const normalizeUrl = require('normalize-url');

const normalizeInput = async (resolve, root, args, context, info) => {
    if (args.email) {
        args.email = args.email.trim().toLowerCase();
    }
    if (args.feedUrl) {
        try {
            args.feedUrl = normalizeUrl(args.feedUrl);
        } catch (e) {
            args.feedUrl = '';
        }
    }
    const result = await resolve(root, args, context, info);
    return result;
};

module.exports = normalizeInput;
