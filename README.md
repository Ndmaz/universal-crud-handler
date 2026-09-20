# @universal-crud/next
[![npm version](https://img.shields.io/npm/v/@universal-crud/next.svg)](https://www.npmjs.com/package/@universal-crud/next)
[![npm downloads](https://img.shields.io/npm/dm/@universal-crud/next.svg)](https://www.npmjs.com/package/@universal-crud/next)
[![CI](https://github.com/Ndmaz/universal-crud-handler/actions/workflows/ci.yml/badge.svg)](https://github.com/Ndmaz/universal-crud-handler/actions/workflows/ci.yml)
Policy-driven, registry-based CRUD and domain-action dispatcher for Next.js App Router.

`@universal-crud/next` provides a small request-dispatching layer for applications that want to expose model/domain actions through a consistent API route while keeping authentication, database access, business logic, middleware, and rate limiting under application control.

## Features

- Registry-based dispatching — route requests to registered model modules.
- Action allowlisting — only actions declared in model metadata can be called.
- Authentication and role checks — plug in your own authentication through `resolveAuth`.
- Protected fields — remove sensitive fields from both incoming arguments and returned data.
- Middleware — run global and per-model middleware before the action handler.
- Rate limiting — plug in any rate limiter through a small interface.
- Guest create — optionally allow unauthenticated POST/create requests while keeping other writes protected.
- Flexible action resolution — supports common action naming conventions.
- Optional React Query helpers — `useCrudQuery` and `useCrudMutation` for applications using TanStack Query.
- Registry generator CLI — generate a registry from a consumer project's CRUD directory.

> Scope: v0.1 is designed for the Next.js App Router. It is not a standalone Express/Fastify backend.

## Installation

```bash
npm install @universal-crud/next
```

The package expects Next.js and React as peer dependencies. The client hooks also require TanStack React Query v5.

## Basic setup

A typical application can expose all registered actions through one dynamic App Router route:

```ts
// src/app/api/[model]/[action]/route.ts
import { createCrudHandler } from '@universal-crud/next';
import { NextRequest } from 'next/server';
import { crudRegistry } from '@/lib/crud/registry';

const handler = createCrudHandler({ registry: crudRegistry });

type RouteContext = {
  params: Promise<{ model: string; action: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return handler(req, await context.params);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return handler(req, await context.params);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return handler(req, await context.params);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return handler(req, await context.params);
}
```

A CRUD module contains its metadata and action functions:

```ts
// src/lib/crud/User.ts
export const meta = {
  model: 'User',
  actions: ['find', 'create', 'update', 'delete'],
  protectedFields: ['password'],
  allowGuestCreate: true,
  restricted: { delete: 'ADMIN' },
};

export async function find(args: { id?: string }) {
  // database/domain logic
}

export async function create(args: { name?: string; email?: string; password?: string }) {
  // database/domain logic
}

export async function update(args: { id?: string; name?: string; email?: string }) {
  // database/domain logic
}

export async function deleteUser(args: { id?: string }) {
  // database/domain logic
}
```

The registry connects the model name to its module:

```ts
import * as User from './User';

export const crudRegistry = {
  User: { module: User, meta: User.meta },
};
```

## Request format

The default route shape is `/api/:model/:action`.

Examples:

```text
GET    /api/User/find?id=1
POST   /api/User/create
PUT    /api/User/update
DELETE /api/User/delete?id=1
```

GET arguments come from URL search parameters. POST, PUT, and DELETE arguments are read from the JSON request body.

## Metadata and policies

### actions

Required list of actions that may be dispatched. A request for an undeclared action is rejected.

```ts
actions: ['find', 'create', 'update', 'delete']
```

### protectedFields

Fields listed here are removed from input arguments before the action handler receives them and from the action result before it is returned.

```ts
protectedFields: ['password', 'resetToken']
```

The current implementation performs shallow field sanitization.

### restricted

Restrict individual actions to one or more roles:

```ts
restricted: {
  delete: 'ADMIN',
  publish: ['ADMIN', 'EDITOR'],
}
```

Authentication and role information come from your application's `resolveAuth` implementation.

### allowGuestCreate

When enabled, unauthenticated POST/create requests are allowed. It does not make PUT/update or DELETE requests available to guests.

### rateLimit

A model can opt out of the configured rate limiter with `rateLimit: { enabled: false }`. The global rate limiter is supplied through `createCrudHandler`.

## Authentication

Authentication is intentionally application-owned. Provide a `resolveAuth` function that converts your session/token into `AuthContext`:

```ts
const handler = createCrudHandler({
  registry: crudRegistry,
  resolveAuth: async (req) => ({
    isAuthenticated: true,
    userId: '123',
    role: 'USER',
  }),
});
```

There is no built-in NextAuth integration in v0.1. This keeps the package independent of a specific authentication provider.

## Middleware

Global middleware can be supplied when creating the handler. Individual modules can also define middleware in their metadata.

```ts
const handler = createCrudHandler({
  registry: crudRegistry,
  middleware: [
    async (args, ctx) => {
      // logging, validation, auditing, etc.
    },
  ],
});
```

Global middleware runs before per-model middleware. Middleware receives the action arguments and a `CrudContext` containing the request, authentication context, and optional logger.

## Rate limiting

Supply your own rate limiter:

```ts
const handler = createCrudHandler({
  registry: crudRegistry,
  rateLimit: async (key, meta) => {
    return { ok: true, remaining: 99 };
  },
});
```

The limiter receives the authenticated userId when available; otherwise it uses `x-forwarded-for`, then `anonymous`. It also receives model, action, and whether the request is a write.

The exported memory rate limiter is process-local and should not be treated as a distributed production rate limiter.

## Action resolution

For a model named User and action find, the dispatcher checks common function names including:

```text
module.find
module.findUser
module.FindUser
```

This allows model files to use either generic action names or model-specific exports such as `deleteUser`.

## Registry generator

Run from the consumer project:

```bash
npx crud-generate-registry
```

By default it scans `src/lib/crud` and generates `src/lib/crud/registry.ts`. The generator scans direct `.ts` and `.js` files only and uses each filename as the model key.

For a different directory, set `CRUD_DIR`. In PowerShell:

```powershell
$env:CRUD_DIR='src/domain/crud'
npx crud-generate-registry
```

## Client helpers

The package exports a small fetch client:

```ts
import { createCrudClient } from '@universal-crud/next';

const client = createCrudClient('/api');
const users = await client.request('User', 'find', 'GET', undefined, { id: 1 });
```

It also provides React Query helpers:

```tsx
import { useCrudQuery, useCrudMutation } from '@universal-crud/next';

const users = useCrudQuery('User', 'find');
const createUser = useCrudMutation('User', 'create', 'POST');
```

These hooks use TanStack React Query and do not implement their own query/cache system.

## Architecture

```text
Next.js Route
      |
      v
createCrudHandler
      |
      v
dispatcher
      |
      +-- registry lookup
      +-- action allowlist
      +-- handler resolution
      +-- authentication / role checks
      +-- rate limiting
      +-- input sanitization
      +-- global middleware
      +-- model middleware
      +-- action execution
      +-- output sanitization
      |
      v
JSON response
```

The package does not own your database/ORM, authentication provider, business logic, distributed rate-limit infrastructure, or logging infrastructure.

## Example application

A minimal Next.js consumer application is included in `examples/next-app`.

```bash
cd examples/next-app
npm install
npm run dev
```

Then try:

```bash
curl 'http://localhost:3000/api/User/find'
```

The example demonstrates registry-based dispatch, protected-field sanitization, guest create, an ADMIN-only delete action, and registry generation.

## v0.1 scope and limitations

- Next.js App Router is the supported server environment.
- Protected-field sanitization is shallow.
- The included memory rate limiter is process-local.
- Registry generation scans one directory level and uses filenames as model names.
- Authentication is supplied by the application.
- Validation schemas are not imposed by the package.

These boundaries are intentional for the initial release.

## License

MIT

