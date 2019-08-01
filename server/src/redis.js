const redis = require('redis');
const { promisify } = require('util');

const redisClient = redis.createClient();
const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);

redisClient.on('error', (err) => {
    console.log(err);
});

module.exports = {
    redisClient,
    hgetallAsync,
    getAsync,
};
