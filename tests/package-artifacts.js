import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const result = JSON.parse(
  execFileSync(npm, ["pack", "--ignore-scripts", "--dry-run", "--json"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  }),
);

if (result.length !== 1) {
  throw new Error(`Expected one packed artifact, received ${result.length}.`);
}

const packedFiles = new Set(result[0].files.map(({ path }) => normalize(path)));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const sourceMappingPattern = /[#@]\s*sourceMappingURL=([^\s*]+)/gu;

const componentDeclarations = ["dist/components.d.ts", "dist/components/catalog.d.ts"]
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
for (const alias of ["Box", "Stack", "Inline", "Shell", "ShellNav", "ShellMain"]) {
  const declarationPattern = new RegExp(String.raw`@deprecated[^]*?function ${alias}\b`);
  if (!declarationPattern.test(componentDeclarations)) {
    throw new Error(`Public ${alias} declaration is missing @deprecated guidance.`);
  }
}

const componentExport = packageJson.exports["./*"];
if (
  componentExport?.import !== "./dist/entries/*.js" ||
  componentExport?.types !== "./dist/entries/*.d.ts"
) {
  throw new Error("Expected component subpaths to use the dedicated entry pattern.");
}

const componentEntries = readdirSync("src/entries")
  .filter((file) => file.endsWith(".ts"))
  .map((file) => file.slice(0, -3));

for (const component of componentEntries) {
  if (!packedFiles.has(normalize(`dist/entries/${component}.js`))) {
    throw new Error(`Packed artifact is missing dist/entries/${component}.js.`);
  }

  const source = readFileSync(`dist/entries/${component}.js`, "utf8");
  if (source.trim().length === 0) {
    throw new Error(`dist/entries/${component}.js is empty.`);
  }
  if (source.includes("../components.js") || source.includes("themes/default")) {
    throw new Error(`dist/entries/${component}.js depends on the aggregate component entry.`);
  }
}

for (const component of ["input", "label"]) {
  const source = readFileSync(`dist/entries/${component}.js`, "utf8");
  for (const unrelated of ["Dialog", "Popover", "Sidebar", "VirtualTable"]) {
    if (source.includes(unrelated)) {
      throw new Error(`dist/${component}.js unexpectedly includes ${unrelated}.`);
    }
  }
}

for (const cssExport of ["foundations", "input", "label"]) {
  const key = `./default/${cssExport}.css`;
  const target = packageJson.exports[key]?.default;
  if (typeof target !== "string" || !packedFiles.has(normalize(target.replace(/^\.\//u, "")))) {
    throw new Error(`Expected ${key} to resolve to packed granular CSS.`);
  }
}

if (packageJson.exports["./default/styles/*"]?.default !== "./src/themes/default/styles/*") {
  throw new Error("Expected all individual default component styles to be publicly addressable.");
}

const inputCss = readFileSync("src/themes/default/styles/forms/input.css", "utf8");
if (inputCss.includes('data-slot="dialog') || inputCss.includes('data-slot="sidebar')) {
  throw new Error("Granular input CSS includes unrelated component selectors.");
}

for (const file of result[0].files) {
  if (!/\.(?:css|d\.ts|js)$/u.test(file.path)) continue;

  const source = readFileSync(file.path, "utf8");
  for (const match of source.matchAll(sourceMappingPattern)) {
    const reference = match[1];
    if (reference.startsWith("data:")) continue;
    if (/^[a-z][a-z\d+.-]*:/iu.test(reference)) {
      throw new Error(`${file.path} references external source map ${reference}.`);
    }

    const mapPath = normalize(join(dirname(file.path), decodeURIComponent(reference)));
    if (!packedFiles.has(mapPath)) {
      throw new Error(`${file.path} references missing packed source map ${mapPath}.`);
    }
  }
}
