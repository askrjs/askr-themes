import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const consumerRoot = mkdtempSync(join(tmpdir(), "askr-themes-consumer-"));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

try {
  const packResult = JSON.parse(
    execFileSync(npm, ["pack", "--ignore-scripts", "--json", "--pack-destination", consumerRoot], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }),
  );
  const tarball = join(consumerRoot, packResult[0].filename);

  writeFileSync(
    join(consumerRoot, "package.json"),
    JSON.stringify({ name: "askr-themes-consumer", private: true, type: "module" }),
  );
  execFileSync(
    npm,
    ["install", "--ignore-scripts", "--no-package-lock", "--legacy-peer-deps", tarball],
    { cwd: consumerRoot, stdio: "pipe" },
  );
  writeFileSync(
    join(consumerRoot, "index.ts"),
    [
      'import "@askrjs/themes";',
      'import "@askrjs/themes/default";',
      'import "@askrjs/themes/presets";',
      'import "@askrjs/themes/default/tokens.css";',
      'import "@askrjs/themes/templates/theme/index.css";',
    ].join("\n"),
  );
  writeFileSync(
    join(consumerRoot, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Bundler",
        strict: true,
        noEmit: true,
      },
      include: ["index.ts"],
    }),
  );

  const typescriptCli = resolve(repositoryRoot, "node_modules/typescript/lib/tsc.js");
  execFileSync(process.execPath, [typescriptCli, "-p", join(consumerRoot, "tsconfig.json")], {
    cwd: consumerRoot,
    stdio: "pipe",
  });

  const installedPackage = JSON.parse(
    readFileSync(join(consumerRoot, "node_modules/@askrjs/themes/package.json"), "utf8"),
  );
  const sourcePackage = JSON.parse(readFileSync(join(repositoryRoot, "package.json"), "utf8"));
  if (installedPackage.version !== sourcePackage.version) {
    throw new Error(`Installed unexpected themes version ${installedPackage.version}.`);
  }
} finally {
  rmSync(consumerRoot, { recursive: true, force: true });
}
