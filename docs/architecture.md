# Architecture

## 1. Purpose

The package provides a thin dispatch layer between a Next.js App Router route and application-owned domain/model functions.

It does not own the database, authentication provider, business rules, or distributed infrastructure.

The main flow is:

```text
Next.js Route
     |
     v
createCrudHandler()
     |
     v
dispatch()
     |
     +--> registry lookup
     +--> action allowlist
     +--> handler resolution
     +--> authentication
     +--> role authorization
     +--> rate limiting
     +--> request argument parsing
     +--> input sanitization
     +--> global middleware
     +--> model middleware
     +--> action handler
     +--> output sanitization
     |
     v
successResponse() / errorResponse()
     |
     v
NextResponse
```

## 2. Source layout

```text
src/
├── index.ts
├── core/
│   ├── createCrudHandler.ts
│   ├── dispatcher.ts
│   ├── errors.ts
│   ├── response.ts
│   ├── types.ts
│   └── utils.ts
├── helpers/
│   ├── actionResolver.ts
│   └── sanitize.ts
├── registry/
│   ├── index.ts
│   └── types.ts
├── rate-limit/
│   ├── index.ts
│   ├── memory.ts
│   └── types.ts
└── client/
    ├── crudClient.ts
    └── hooks.ts
```

## 3. Server-side boundaries

The server side is deliberately split into three responsibilities:

### Route integration

The application owns the Next.js route and decides which HTTP methods are exported.

### Dispatch policy

The package owns the common policy pipeline: registry lookup, action checks, authorization, sanitization, middleware, rate limiting, and handler invocation.

### Domain logic

The application owns the actual implementation of actions such as database queries, writes, payments, validation, and business rules.

This separation lets the package remain useful without forcing a database ORM or authentication system on the consumer.

## 4. Data flow

For GET requests, arguments are constructed from URL search parameters.

For POST, PUT, and DELETE requests, arguments are read from the JSON body. Invalid or absent JSON currently falls back to an empty object.

The same argument object is then passed through global middleware, model middleware, and the action handler. Middleware can therefore intentionally modify the arguments before the handler executes.

Input protected fields are removed before middleware and handler execution.

The handler result is sanitized again before it becomes the successful HTTP response.

## 5. Authentication boundary

Authentication is resolved by an application-provided function:

```ts
resolveAuth?: (req: NextRequest) => Promise<AuthContext | null>
```

The package does not inspect a specific session library.

If an action is restricted or is a write action that is not an allowed guest create, authentication is required.

Role restrictions are then evaluated against `auth.role`.

## 6. Rate-limit boundary

The package defines a small asynchronous rate-limiter contract. The implementation can be backed by an external system.

The built-in memory limiter is intentionally simple and process-local. It is useful for development and small single-process deployments, but it is not a distributed limiter.

## 7. Design principles in v0.1

- Keep application ownership of domain concerns.
- Centralize repeated request policy.
- Make actions explicit through metadata.
- Fail before invoking an unauthorized action.
- Sanitize sensitive fields at both input and output boundaries.
- Keep extension points small.
- Avoid coupling the first release to a particular database or authentication provider.
