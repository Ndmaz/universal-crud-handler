# Registry

## Purpose

The registry maps a public model name to its module and metadata.

The dispatcher uses it to determine whether a model exists, which actions are allowed, and which policy configuration applies.

## defineCrudModule(module)

`defineCrudModule` is a TypeScript helper that returns the supplied module unchanged while checking it against the `CrudModule` generic constraint.

Example:

```ts
export const User = defineCrudModule({
  meta: {
    model: "User",
    actions: ["find"],
  },

  async find(args, ctx) {
    // ...
  },
});
```

## createRegistry(modules)

Converts a simple module map into the full `CrudRegistry` shape.

Input:

```ts
createRegistry({
  User,
  Product,
});
```

Result:

```ts
{
  User: {
    module: User,
    meta: User.meta,
  },
  Product: {
    module: Product,
    meta: Product.meta,
  },
}
```

## Generated registry

The CLI generates the same conceptual shape from files in the consumer application.

By default:

```text
src/lib/crud/
├── User.ts
├── Product.ts
└── registry.ts
```

becomes a registry containing `User` and `Product`.

The generated registry imports each direct `.ts` or `.js` file, excluding filenames containing `registry` or `generate`.

The filename becomes the model key.

The generator is intentionally simple in v0.1: it does not recursively scan directories, parse source code, or infer database schemas.
