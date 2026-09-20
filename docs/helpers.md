# Helpers

## actionResolver.ts

### resolveHandlerFunction(module, action, model)

The resolver supports three naming conventions.

For action `find` and model `User`:

1. `module.find`
2. `module.findUser`
3. `module.FindUser`

The first truthy matching export is returned.

This lets a consumer choose between generic action exports and model-specific names such as `deleteUser`.

The resolver does not inspect or invoke the function. It only selects it.

## sanitize.ts

### sanitizeInput(data, protectedFields)

Removes protected fields before action middleware and handlers receive request arguments.

### sanitizeOutput(data, protectedFields)

Removes the same protected fields from action results.

Both functions delegate to the internal recursive `sanitize` function.

### Sanitization behavior

- `null` and `undefined` are returned unchanged.
- Arrays are recursively sanitized item by item.
- Plain objects are shallow-cloned, protected keys are deleted, and remaining values are recursively sanitized.
- Non-plain objects are returned unchanged.

The recursion means nested plain objects and arrays are also protected.

Example:

```ts
const input = {
  name: "Alice",
  password: "secret",
  profile: {
    password: "nested-secret",
  },
};

sanitizeInput(input, ["password"]);
```

produces an equivalent shape without either password field.

The sanitizer creates new plain-object/array structures rather than mutating the original input.

## Security boundary

Protected fields are a transport-level policy. They should not be treated as a replacement for application-level validation, database permissions, or authorization rules.
