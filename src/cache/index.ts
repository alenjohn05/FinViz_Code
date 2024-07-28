import { createClient } from "redis";
import { createPool, Pool } from "generic-pool";
import { config } from "../config";

export const redisPool: Pool<ReturnType<typeof createClient>> = createPool(
  {
    create: async () => {
      const client = createClient({
        url: `redis://${config.redis.host}:${config.redis.port}`,
      });
      await client.connect();
      return client;
    },
    destroy: async (client) => {
      await client.quit();
      return Promise.resolve();
    },
  },
  { max: 50, min: 5 }
);