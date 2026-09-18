# Contracts

This document describes the public contracts exported by the package.

## AuthContext

```ts
interface AuthContext {
  isAuthenticated?: boolean;
  role?: string;
  userId?: string | number;
  raw?: unknown;
}
```

### Purpose

Represents authentication information supplied by the consumer.

- `isAuthenticated` — whether the request is authenticated.
- `role` — optional application-defined role.
- `userId` — optional stable identity used by authorization and rate limiting.
- `raw` — optional original authentication/session object.

The package does not create this context itself.

## CrudMiddleware

```ts
type CrudMiddleware = (
  args: any,
  ctx: CrudContext
) => Promise<void>;
```

Middleware receives the current mutable action arguments and request context.

Middleware can inspect or modify `args`. Global middleware executes before model middleware.

## RateLimiter

```ts
type RateLimiter = (
  key: string,
  meta: RateLimitMeta
) => Promise<RateLimitResult>;
```

The implementation decides whether the request may continue.

### RateLimitMeta

```ts
interface RateLimitMeta {
  model: string;
  action: string;
  isWrite: boolean;
}
```

### RateLimitResult

```ts
interface RateLimitResult {
  ok: boolean;
  remaining?: number;
  reset?: number;
}
```

The dispatcher currently uses `ok` to decide whether to continue. `remaining` and `reset` are available for implementations that need them.

## CrudMeta

```ts
interface CrudMeta {
  model?: string;
  actions: string[];
  protectedFields?: string[];
  restricted?: Record<string, string | string[]>;
  allowGuestCreate?: boolean;
  rateLimit?: {
    enabled?: boolean;
  };
  middleware?: CrudMiddleware[];
}
```

### Contract

- `actions` is the action allowlist.
- `protectedFields` defines fields removed recursively from plain objects and arrays.
- `restricted` maps an action to one role or multiple roles.
- `allowGuestCreate` only affects unauthenticated POST/create.
- `rateLimit.enabled === false` disables the configured global limiter for that model.
- `middleware` contains model-specific middleware.

## CrudContext

```ts
interface CrudContext {
  auth?: AuthContext;
  req: NextRequest;
  logger?: Console;
}
```

The context gives handlers and middleware access to the request and resolved authentication information.

## CrudModule

```ts
interface CrudModule {
  meta: CrudMeta;
  [key: string]: any;
}
```

A module is an object containing metadata plus exported action functions.

## CrudRegistry

```ts
type CrudRegistry = Record<
  string,
  {
    module: CrudModule;
    meta: CrudMeta;
  }
>;
```

The registry is the dispatcher's source of truth for model names, modules, and metadata.

## CreateCrudHandlerOptions

```ts
interface CreateCrudHandlerOptions {
  registry: CrudRegistry;
  resolveAuth?: (req: NextRequest) => Promise<AuthContext | null>;
  rateLimit?: RateLimiter | false;
  middleware?: CrudMiddleware[];
  logger?: Console;
}
```

- `registry` is required.
- `resolveAuth` is optional; omit it when the application has no authentication mechanism.
- `rateLimit` accepts a custom limiter or `false`.
- `middleware` provides global middleware.
- `logger` is passed through the request context.

## Behavioral contract

The dispatcher will not call an action unless:

1. the model exists in the registry;
2. the action appears in `meta.actions`;
3. a handler function can be resolved;
4. required authentication is present;
5. required role authorization succeeds;
6. the configured rate limiter allows the request.

Protected input fields are removed before the action is called, and protected output fields are removed before the response is returned.
