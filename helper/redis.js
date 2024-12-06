const { Redis } = require("ioredis");

const redis = new Redis({
  port: +process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  connectTimeout: 10000, // Waktu tunggu koneksi dalam milidetik
});

redis.on("error", (err) => {
  console.log(process.env.REDIS_PORT);
  console.log(process.env.REDIS_HOST);
  console.error("Redis connection error:", err);
});
redis.on("connect", () => {
  console.log("Connected to Redis");
});

module.exports = redis;
