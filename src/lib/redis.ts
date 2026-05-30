import Redis from "ioredis";

type MaybeRedis = Redis | null;

const globalForRedis = globalThis as unknown as {
  redis?: MaybeRedis;
};

function createClient(): MaybeRedis {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
  });
  client.on("error", (err) => {
    console.warn("[redis] error:", err.message);
  });
  return client;
}

export const redis: MaybeRedis =
  globalForRedis.redis ?? (globalForRedis.redis = createClient());

export function redisEnabled(): boolean {
  return redis !== null;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ ok: boolean; remaining: number }> {
  if (!redis) return { ok: true, remaining: limit };
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    return { ok: count <= limit, remaining: Math.max(0, limit - count) };
  } catch {
    return { ok: true, remaining: limit };
  }
}
