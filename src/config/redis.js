const Redis = require('ioredis');

let redis = null;

if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });
}

module.exports = redis;
