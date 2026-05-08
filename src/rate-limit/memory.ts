import { MemoryRateLimitOptions } from "./types";
import { RateLimiter } from "../core/types";

export function createMemoryRateLimiter(
  options: MemoryRateLimitOptions
): RateLimiter {
  const store = new Map<
    string,
    { count: number; expires: number }
  >();

  return async (key) => {
    const now = Date.now();
    const windowMs = options.windowSec * 1000;

    const existing = store.get(key);

    if (!existing || existing.expires < now) {
      store.set(key, {
        count: 1,
        expires: now + windowMs,
      });
      return { ok: true, remaining: options.limit - 1 };
    }

    if (existing.count >= options.limit) {
      return { ok: false };
    }

    existing.count++;
    return {
      ok: true,
      remaining: options.limit - existing.count,
    };
  };
}
