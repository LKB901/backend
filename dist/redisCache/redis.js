"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acquireLock = acquireLock;
exports.releaseLock = releaseLock;
const redis_1 = require("@upstash/redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "../../.env" });
const redis = new redis_1.Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
async function acquireLock(key, ttl // milliseconds
) {
    const lockId = crypto.randomUUID();
    const result = await redis.set(key, lockId, {
        nx: true, // Only set if not exists
        px: ttl, // Set expiration in milliseconds
    });
    if (result === 'OK') {
        return lockId;
    }
    return null;
}
async function releaseLock(key, lockId) {
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
