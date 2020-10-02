const redis = require('redis');
const { promisify } = require('util');

const redisClient = redis.createClient();
const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);

redisClient.on('error', (err) => {
    console.log(err);
});

const lockNamespace = 'lock';
redisClient.del(lockNamespace);

const isLocked = data => new Promise((resolve, reject) => {
    redisClient.sismember(lockNamespace, data, (error, reply) => {
        if (error) return reject(error);
        return resolve(reply);
    });
});

const lock = data => new Promise((resolve, reject) => {
    redisClient.sadd(lockNamespace, data, (error, reply) => {
        if (error) return reject(error);
        return resolve(reply);
    });
});

const unlock = data => new Promise((resolve, reject) => {
    redisClient.srem(lockNamespace, data, (error, reply) => {
        if (error) return reject(error);
        return resolve(reply);
    });
});

module.exports = {
    redisClient,
    hgetallAsync,
    getAsync,
    isLocked,
    lock,
    unlock,
};
