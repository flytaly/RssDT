const { rule } = require('graphql-shield');
const { getAsync, redisClient } = require('../redis');

/**
 * @param {string} identityArgName - name of argument that will be used as identity of current GraphQL query
 * @param {string} ruleName - an additional string to distinguish different rule with the same identity
 */
const createRateLimitRuleFromArgument = (identityArgName, ruleName) => rule(
    ruleName,
)(async (parent, args/* , ctx, info */) => {
    const initialCooldown = 60 * 1000; // MS
    const EXPIRY = 60 * 60 * 12; // SEC
    const identity = args[identityArgName];
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
    createRateLimitRuleFromArgument,
};
