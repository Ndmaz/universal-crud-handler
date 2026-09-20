# Core

## createCrudHandler.ts

### createCrudHandler(options)

Creates the Next.js-facing handler function.

It delegates request processing to `dispatch`, then converts the returned value into a successful JSON response. Exceptions are passed to `errorResponse`.

The function is the package's main integration point.

## dispatcher.ts

### dispatch(options, req, params)

The dispatcher is the central request pipeline.

### Step 1 — Registry lookup

```ts
const entry = registry[model];
```

If the model does not exist, `ModelNotFoundError` is thrown.

### Step 2 — Action allowlist

```meta.actions.includes(action)
```

Only explicitly declared actions can be called.

### Step 3 — Handler resolution

`resolveHandlerFunction` searches the module for supported naming conventions. If no function is found, the request is rejected.

### Step 4 — Authentication

The optional `resolveAuth` callback is called with the request.

Write requests require authentication unless they are POST/create requests with `allowGuestCreate` enabled.

### Step 5 — Role authorization

If `meta.restricted[action]` exists, the resolved role must match one of the configured roles.

### Step 6 — Rate limiting

When a rate limiter is configured and the model has not disabled it, the dispatcher chooses a key:

1. authenticated `userId`;
2. `x-forwarded-for`;
3. `anonymous`.

It then supplies model, action, and write/read information to the limiter.

### Step 7 — Parse arguments

GET requests use `req.nextUrl.searchParams`.

Other supported methods use `req.json()`. If JSON parsing fails, the dispatcher currently uses an empty object.

### Step 8 — Input sanitization

`sanitizeInput` removes protected fields before middleware and the handler see the arguments.

### Step 9 — Middleware

Global middleware executes first, followed by the model's middleware.

The same mutable argument object is passed through both layers.

### Step 10 — Action execution

The resolved action function is called as:

```ts
handlerFn(args, ctx)
```

### Step 11 — Output sanitization

The action result is passed through `sanitizeOutput` before returning from the dispatcher.

## errors.ts

The error classes represent expected HTTP failures:

| Error | Status | Meaning |
|---|---:|---|
| `ModelNotFoundError` | 404 | Registry model does not exist |
| `ActionNotAllowedError` | 403 | Action is not declared or cannot be resolved |
| `UnauthorizedError` | 401 | Authentication is required |
| `ForbiddenError` | 403 | Authenticated role is not permitted |
| `RateLimitExceededError` | 429 | Rate limiter rejected the request |
| `CrudError` | configurable | Base package error |

Unknown errors are intentionally converted into a generic 500 response.

## response.ts

### successResponse(data)

Returns:

```ts
NextResponse.json(data, { status: 200 })
```

### errorResponse(error)

Known `CrudError` values become:

```json
{ "error": "message" }
```

with the error's status.

Unknown errors become HTTP 500 with:

```json
{ "error": "Internal Server Error" }
```

This avoids exposing arbitrary internal error details through the default response layer.
