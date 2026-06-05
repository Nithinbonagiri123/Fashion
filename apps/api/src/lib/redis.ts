import { Redis } from "ioredis";
import { env } from "./env.js";

declare global {
  // eslint-disable-next-line no-var
  var __redis__: Redis | undefined;
}

export const redis =
  globalThis.__redis__ ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });

if (env.NODE_ENV !== "production") {
  globalThis.__redis__ = redis;
}

export const RedisKeys = {
  idempotency: (key: string) => `idemp:${key}`,
  anonymousCart: (token: string) => `cart:anon:${token}`,
  sessionRateLimit: (ip: string) => `rl:${ip}`,
} as const;
