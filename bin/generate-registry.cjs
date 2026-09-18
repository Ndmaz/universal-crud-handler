#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function main() {
  const root = process.cwd();
  const crudDir = path.resolve(root, process.env.CRUD_DIR ?? "src/lib/crud");
  const outFile = path.join(crudDir, "registry.ts");

  if (!fs.existsSync(crudDir)) {
    console.error("CRUD directory not found at", crudDir);
    process.exitCode = 1;
    return;
  }

  const files = fs
    .readdirSync(crudDir)
    .filter(
      (file) =>
        (file.endsWith(".ts") || file.endsWith(".js")) &&
        !file.includes("registry") &&
        !file.includes("generate")
    )
    .sort();

  const imports = [];
  const entries = [];

  for (const file of files) {
    const modelName = path.basename(file, path.extname(file));
    const importName = `mod_${modelName}`;

    imports.push(`import * as ${importName} from './${modelName}';`);
    entries.push(
      `  '${modelName}': { module: ${importName}, meta: (${importName} as any).meta ?? {} },`
    );
  }

  const configuredDir = process.env.CRUD_DIR ?? "src/lib/crud";
  const content = `// AUTO-GENERATED - do not edit.
// Regenerate with: CRUD_DIR=${configuredDir} crud-generate-registry
${imports.join("\n")}

export const crudRegistry = {
${entries.join("\n")}
} as const;

export type CrudRegistry = typeof crudRegistry;
`;

  fs.writeFileSync(outFile, content, "utf8");
  console.log("Generated", outFile);
}

main();
