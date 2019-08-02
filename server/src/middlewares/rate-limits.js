const { rule } = require('graphql-shield');
const { getAsync, redisClient } = require('../redis');

const isTest = process.env.NODE_ENV === 'test';

/**
 * @param {string} ruleName - an additional string to distinguish different rule with the same identity
 * @param {function} getIdentityFromArgs - cb that receives argument and returns string which
 * will be used as identity of current GraphQL query
 */
const createRateLimitRuleFromArguments = (getIdentity, ruleName) => rule(
    ruleName,
)(async (parent, args/* , ctx, info */) => {
    // TODO: add tests
    if (isTest) return true; // workaround to not call redis in tests

    const initialCooldown = 60 * 1000; // MS
    const EXPIRY = 60 * 60 * 12; // SEC
    const identity = getIdentity(args);
    const fieldNames = { attempt: `${identity}:${ruleName}:attempt`, ts: `${identity}:${ruleName}:ts` };
    const attempt = Number(await getAsync(fieldNames.attempt) || 0);
    const tsPrev = await getAsync(fieldNames.ts);
    const timestamp = Date.now();
    if (!tsPrev) {
        redisClient.set(fieldNames.ts, timestamp, 'EX', EXPIRY);
        redisClient.set(fieldNames.attempt, 0, 'EX', EXPIRY);
        return true;
    }

    const nextTime = Number(tsPrev) + initialCooldown * (2 ** attempt);
    const timeLeft = nextTime - timestamp;
    if (timeLeft > 0) {
        return new Error(`Too often. Wait ${Math.round(timeLeft / 6000) / 10} minutes`);
    }
    redisClient.set(fieldNames.ts, timestamp, 'EX', EXPIRY);
    redisClient.incr(fieldNames.attempt);
    return true;
});

module.exports = {
    createRateLimitRuleFromArguments,
};
