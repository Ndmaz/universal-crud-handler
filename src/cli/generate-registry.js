// src/cli/generate-registry.js
const fs = require("fs");
const path = require("path");

function main() {
    //the address of the project is assigned to root and the user should provide the direction of
    //crud files or abide by the folder structure
    const root = process.cwd();
    const crudDir = path.join(root, process.env.CRUD_DIR ?? "src/lib/crud");
    const outFile = path.join(crudDir, "registry.ts");
//if nither conditions are met the function ends
    if (!fs.existsSync(crudDir)) {
        console.error("lib/crud directory not found at", crudDir);
        process.exit(1);
    }
//the files that end with .ts or .js and arent registry itself and dont have generate on it will be in the files
    const files = fs
        .readdirSync(crudDir)
        .filter((f) => (f.endsWith(".ts") || f.endsWith(".js")) && !f.includes("registry") && !f.includes("generate"));

    let imports = [];
    let entries = [];
//for each file, the following happens
    for (const file of files) {
        //moduleName comes from the name of that file which is used to construct the importName
        //it will be pushed to the imports array based on its name and from its address 
        //then the module will be used in the array of objects to access the module and the meta info 
        const modelName = path.basename(file, path.extname(file));
        const importName = `mod_${modelName}`;
        imports.push(`import * as ${importName} from './${modelName}';`);
        entries.push(`  '${modelName}': { module: ${importName}, meta: (${importName} as any).meta ?? {} },`);
    }

    const content = `// AUTO-GENERATED - do not edit (run: CRUD_DIR=${process.env.CRUD_DIR ?? "src/lib/crud"} node src/cli/generate-registry.js)\n${imports.join("\n")}\n\nexport const crudRegistry = {\n${entries.join("\n")}\n} as const;\n\nexport type CrudRegistry = typeof crudRegistry;\n`;

    fs.writeFileSync(outFile, content, "utf8");
    console.log("Generated", outFile);
}

if (require.main === module) {
    main();
}
