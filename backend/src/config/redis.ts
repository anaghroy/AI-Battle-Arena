import { createClient } from "redis";
import config from "./config.js";

const redisClient = createClient({
  url: config.REDIS_URL as string,
});

redisClient.on("connect", () => {
  console.log("Redis Connected");
});

redisClient.on("error", (err: any) => {
  console.log("Redis Error:", err);
});


/**Connecting to Redis */
async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export { redisClient, connectRedis };
