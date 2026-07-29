import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
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
    JSON.stringify({
      name: "askr-themes-consumer",
      private: true,
      type: "module",
      dependencies: {
        "@askrjs/askr": "0.0.64",
        "@askrjs/ui": "0.0.13",
      },
    }),
  );
  execFileSync(npm, ["install", "--ignore-scripts", "--no-package-lock", tarball], {
    cwd: consumerRoot,
    stdio: "pipe",
  });
  writeFileSync(
    join(consumerRoot, "index.tsx"),
    [
      'import "@askrjs/themes";',
      'import "@askrjs/themes/default";',
      'import "@askrjs/themes/presets";',
      'import "@askrjs/themes/default/tokens.css";',
      'import "@askrjs/themes/templates/theme/index.css";',
      'import { Block, type BlockProps, type DialogProps, type GridProps, type SidebarRailProps, type TextProps } from "@askrjs/themes/components";',
      'import { withThemeStyles } from "@askrjs/themes/ssr";',
      "const fixture = <Block><span>strict consumer</span></Block>;",
      'const block: BlockProps = { padding: "md" };',
      "const grid: GridProps = { columns: 2 };",
      'const text: TextProps = { tone: "success" };',
      'const rail: SidebarRailProps = { type: "button" };',
      "void fixture; void block; void grid; void text; void rail; void (null as DialogProps | null); void withThemeStyles;",
    ].join("\n"),
  );
  writeFileSync(
    join(consumerRoot, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        jsxImportSource: "@askrjs/askr",
        strict: true,
        skipLibCheck: false,
        noEmit: true,
      },
      include: ["index.tsx"],
    }),
  );

  const typescriptCli = resolve(repositoryRoot, "node_modules/typescript/lib/tsc.js");
  execFileSync(process.execPath, [typescriptCli, "-p", join(consumerRoot, "tsconfig.json")], {
    cwd: consumerRoot,
    stdio: "inherit",
  });

  writeFileSync(
    join(consumerRoot, "runtime.mjs"),
    [
      'const components = await import("@askrjs/themes/components");',
      'const theme = await import("@askrjs/themes/theme");',
      'const ssr = await import("@askrjs/themes/ssr");',
      'for (const name of ["Block", "ThemeScope"]) if (typeof (components[name] ?? theme[name]) !== "function") throw new Error(`Missing ${name}`);',
      'if (typeof ssr.withThemeStyles !== "function") throw new Error("Missing withThemeStyles");',
    ].join("\n"),
  );
  execFileSync(process.execPath, [join(consumerRoot, "runtime.mjs")], {
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
