import IORedis from "ioredis";

let client: IORedis | null = null;

export function getRedis(): IORedis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!client) {
    client = new IORedis(url, { maxRetriesPerRequest: 2, lazyConnect: true });
  }
  return client;
}

export async function cacheGet(key: string): Promise<string | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    return await r.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSec: number): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.set(key, value, "EX", ttlSec);
  } catch {
    /* noop */
  }
}
