import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const contract = JSON.parse(
  readFileSync(new URL("./public-surface.json", import.meta.url), "utf8"),
);
const installedRoot = dirname(fileURLToPath(import.meta.resolve("@askrjs/themes/package.json")));
const manifest = JSON.parse(readFileSync(resolve(installedRoot, "package.json"), "utf8"));
assert.deepEqual(
  manifest.exports,
  contract.exports,
  "Installed package must preserve every reviewed exact export target.",
);

function checkTargets(target) {
  if (typeof target === "string") {
    const file = resolve(installedRoot, target);
    assert.ok(
      !relative(installedRoot, file).startsWith(".."),
      `Target escapes installed package: ${target}`,
    );
    assert.ok(existsSync(file), `Missing installed target: ${target}`);
  } else {
    for (const nested of Object.values(target)) checkTargets(nested);
  }
}

for (const [key, target] of Object.entries(manifest.exports)) {
  checkTargets(target);
  const specifier = "@askrjs/themes" + (key === "." ? "" : key.slice(1));
  const file = fileURLToPath(import.meta.resolve(specifier));
  assert.ok(existsSync(file), `Resolution has no installed file: ${specifier}`);
  if (file.endsWith(".css")) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/gu)) {
      if (match[1].startsWith(".")) {
        assert.ok(
          existsSync(resolve(dirname(file), match[1])),
          `Broken relative CSS import in ${specifier}: ${match[1]}`,
        );
      }
    }
  }
}

const namespaces = new Map();
let retainedValues = 0;
for (const [key, names] of Object.entries(contract.entries)) {
  const specifier = "@askrjs/themes" + key.slice(1);
  const namespace = await import(specifier);
  namespaces.set(specifier, namespace);
  assert.deepEqual(
    Object.keys(namespace).sort(),
    names.values.toSorted(),
    `Unexpected runtime surface: ${specifier}`,
  );
  for (const name of names.values)
    assert.notEqual(namespace[name], undefined, `Missing ${name} at ${specifier}`);
  retainedValues += names.values.length;
}
assert.equal(
  namespaces.get("@askrjs/themes/toaster").Toaster,
  namespaces.get("@askrjs/themes/components").Toaster,
);

const capabilities = JSON.parse(readFileSync(resolve(installedRoot, "capabilities.json"), "utf8"));
for (const capability of capabilities.capabilities) {
  assert.ok(
    existsSync(fileURLToPath(import.meta.resolve(capability.import))),
    `Missing advertised capability import: ${capability.import}`,
  );
  if (capability.exports.length > 0) {
    const namespace = namespaces.get(capability.import);
    assert.ok(
      namespace,
      `Advertised JavaScript capability has no public entry: ${capability.import}`,
    );
    for (const name of capability.exports)
      assert.notEqual(namespace[name], undefined, `Missing advertised capability ${name}`);
  }
}

// Physical sentinels prove the former patterns are closed even when a matching file exists.
for (const [specifier, target] of [
  ["@askrjs/themes/unpublished-probe", "dist/entries/unpublished-probe.js"],
  [
    "@askrjs/themes/default/styles/unpublished-probe.css",
    "src/themes/default/styles/unpublished-probe.css",
  ],
  ["@askrjs/themes/templates/theme/unpublished-probe.css", "templates/theme/unpublished-probe.css"],
]) {
  const file = resolve(installedRoot, target);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, "/* owned installed-package encapsulation probe */\n");
  assert.throws(() => import.meta.resolve(specifier), { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" });
}
for (const specifier of [
  "@askrjs/themes/drawer",
  "@askrjs/themes/sonner",
  "@askrjs/themes/core",
  "@askrjs/themes/controls",
  "@askrjs/themes/overlays",
  "@askrjs/themes/surfaces",
  "@askrjs/themes/navs",
  "@askrjs/themes/parity",
  "@askrjs/themes/components/jsx-types",
  "@askrjs/themes/dist/entries/input.js",
  "@askrjs/themes/src/themes/default/styles/forms/input.css",
])
  assert.throws(() => import.meta.resolve(specifier), { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" });

console.log(
  `Installed Themes: ${Object.keys(manifest.exports).length} exact keys, ${Object.keys(contract.entries).length} ESM namespaces, ${retainedValues} runtime pairs; capability names, CSS imports and closed patterns verified.`,
);
