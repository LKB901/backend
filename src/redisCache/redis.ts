import { Redis } from '@upstash/redis';
import dotenv from "dotenv";
dotenv.config({path:"../../.env"})


const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function acquireLock(
    key: string,
    ttl: number // milliseconds
): Promise<string | null> {
    const lockId = crypto.randomUUID();
    const result = await redis.set(key, lockId, {
        nx: true, // Only set if not exists
        px: ttl,  // Set expiration in milliseconds
    });

    if (result === 'OK') {
        return lockId;
    }
    return null;
}

export async function releaseLock(
    key: string,
    lockId: string
): Promise<boolean> {
    const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
    const result = await redis.eval(script, [key], [lockId]);
    return result === 1;
}
