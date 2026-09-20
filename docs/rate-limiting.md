# Rate Limiting

## Contract

The package exposes:

```ts
type RateLimiter = (
  key: string,
  meta: RateLimitMeta
) => Promise<RateLimitResult>;
```

This keeps infrastructure out of the core package.

A consumer can connect the contract to Redis, a database, an API gateway, or another external service.

## Dispatcher key selection

The dispatcher uses:

1. `auth.userId` when available;
2. `x-forwarded-for` for unauthenticated requests;
3. `anonymous` as a final fallback.

The key is independent of the model/action metadata, which is supplied separately through `RateLimitMeta`.

## Model-level control

A model can disable the configured global limiter:

```ts
rateLimit: {
  enabled: false,
}
```

When `enabled` is explicitly false, the dispatcher skips rate limiting for that model.

## Memory implementation

`createMemoryRateLimiter({ limit, windowSec })` stores counters in a JavaScript `Map`.

For each key it tracks:

- request count;
- expiration timestamp.

When the window expires, the counter starts again.

Example:

```ts
const limiter = createMemoryRateLimiter({
  limit: 100,
  windowSec: 60,
});
```

### Important limitation

The memory store belongs to one Node.js process.

It is therefore not a shared/distributed rate limiter. Multiple server instances will have separate counters.

Use an external/shared implementation when consistent limits across instances are required.
