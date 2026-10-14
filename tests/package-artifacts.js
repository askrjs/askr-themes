import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const packedResult = JSON.parse(
  execFileSync(npm, ["pack", "--ignore-scripts", "--dry-run", "--json"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  }),
);

function findPackRecords(value) {
  if (Array.isArray(value)) return value.flatMap(findPackRecords);
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value.files)) return [value];
  return Object.values(value).flatMap(findPackRecords);
}

const result = findPackRecords(packedResult);

if (result.length !== 1) {
  throw new Error(`Expected one packed artifact with files, received ${result.length}.`);
}

const packedFiles = new Set(result[0].files.map(({ path }) => normalize(path)));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

for (const file of [
  "CHANGELOG.md",
  "README.md",
  "LICENSE",
  "docs/migration-0.5.0.md",
  "docs/0.5.0-public-api.md",
]) {
  if (!packedFiles.has(normalize(file))) {
    throw new Error(`Packed artifact is missing ${file}.`);
  }
}
const sourceMappingPattern = /[#@]\s*sourceMappingURL=([^\s*]+)/gu;

const componentDeclarations = ["dist/components.d.ts", "dist/components/catalog.d.ts"]
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");
for (const alias of ["Box", "Inline", "Shell", "ShellNav", "ShellMain", "LegacyLayoutProps"]) {
  const declarationPattern = new RegExp(String.raw`\b${alias}\b`);
  if (declarationPattern.test(componentDeclarations)) {
    throw new Error(`Removed legacy layout symbol ${alias} is still public.`);
  }
}

if (
  Object.keys(packageJson.exports).length !== 199 ||
  Object.keys(packageJson.exports).some((key) => key.includes("*"))
) {
  throw new Error("Expected the reviewed 199 exact package export keys without wildcard exposure.");
}

const componentEntries = readdirSync("src/entries")
  .filter((file) => file.endsWith(".ts"))
  .map((file) => file.slice(0, -3));

for (const layout of ["stack", "cluster", "center"]) {
  if (!componentEntries.includes(layout)) {
    throw new Error(`Expected supported ${layout} package entry.`);
  }
}

for (const component of componentEntries) {
  const exported = packageJson.exports[`./${component}`];
  if (
    exported?.import !== `./dist/entries/${component}.js` ||
    exported?.types !== `./dist/entries/${component}.d.ts`
  ) {
    throw new Error(`Expected an exact independent package entry for ${component}.`);
  }
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

function visitFiles(directory, callback) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) visitFiles(file, callback);
    else callback(file.replaceAll("\\", "/"));
  }
}
visitFiles("src/themes/default/styles", (file) => {
  const key = `./default/styles/${file.slice("src/themes/default/styles/".length)}`;
  if (packageJson.exports[key]?.default !== `./${file}` || !packedFiles.has(normalize(file))) {
    throw new Error(`Supported granular style ${file} has no exact packed export.`);
  }
});
visitFiles("templates", (file) => {
  if (
    packageJson.exports[`./${file}`]?.default !== `./${file}` ||
    !packedFiles.has(normalize(file))
  ) {
    throw new Error(`Supported template ${file} has no exact packed export.`);
  }
});
for (const key of ["./drawer", "./sonner", "./components/jsx-types"]) {
  if (packageJson.exports[key] !== undefined)
    throw new Error(`Retired path ${key} is still exported.`);
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
