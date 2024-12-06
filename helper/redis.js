const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST, // Alamat host Redis dari Memorystore
  port: process.env.REDIS_PORT, // Port Redis
  password: process.env.REDIS_PASSWORD, // Jika ada, password untuk Redis
});

module.exports = redis;
