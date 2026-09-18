# Client

## crudClient.ts

### createCrudClient(baseUrl = "/api")

Creates a small fetch-based client.

### request(model, action, method, data, query)

Builds:

```text
{baseUrl}/{model}/{action}
```

For GET requests, `query` is encoded as URL search parameters.

For non-GET requests, `data` is JSON-encoded into the request body.

The response body is parsed as JSON. A non-2xx response throws an `Error` using the response's `error` field when available.

The client does not contain authentication logic; normal browser/server fetch behavior and the application's authentication setup remain responsible for credentials.

## hooks.ts

The package exports:

- `useCrudQuery`
- `useCrudMutation`

Both are thin wrappers around TanStack React Query v5.

### useCrudQuery

Accepts:

```ts
useCrudQuery(model, action, queryParams?, options?)
```

It builds a React Query key from model, action, and query parameters and uses `createCrudClient` for the GET request.

### useCrudMutation

Accepts:

```ts
useCrudMutation(model, action, method?, options?)
```

It uses React Query's mutation mechanism and sends the mutation variables as the request body.

The default method is POST.

## Dependency boundary

The client fetch helper itself does not depend on TanStack Query.

The hooks do. Therefore `@tanstack/react-query` is a peer dependency of the package rather than being described as an optional zero-dependency hook implementation.
