# Registry Generator CLI

## Command

From a consumer project:

```bash
npx crud-generate-registry
```

The command is provided by:

```text
bin/generate-registry.cjs
```

It is CommonJS so that the executable remains directly runnable even though the package itself is marked as ESM.

## Default directory

The generator resolves:

```text
<current-working-directory>/src/lib/crud
```

The output is:

```text
src/lib/crud/registry.ts
```

## Custom directory

Set `CRUD_DIR`:

Bash:

```bash
CRUD_DIR=src/domain/crud npx crud-generate-registry
```

PowerShell:

```powershell
$env:CRUD_DIR="src/domain/crud"
npx crud-generate-registry
```

## Discovery rules

The generator:

1. reads the configured directory;
2. selects direct `.ts` and `.js` files;
3. skips filenames containing `registry`;
4. skips filenames containing `generate`;
5. uses the filename without its extension as the model name;
6. creates namespace imports;
7. writes a TypeScript registry.

It does not recursively scan subdirectories.

## Generated metadata

Each entry uses the module's exported `meta` value:

```ts
{
  User: {
    module: mod_User,
    meta: (mod_User as any).meta ?? {},
  },
}
```

The generated file is application source code and is normally committed to the consumer repository.

## Failure behavior

If the CRUD directory does not exist, the CLI prints an error and exits with a non-zero status.

The CLI does not validate database schemas or action implementations. TypeScript/build validation remains the consumer project's responsibility.
