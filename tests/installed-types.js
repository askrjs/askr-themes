import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const consumerRoot = mkdtempSync(join(tmpdir(), "askr-themes-consumer-"));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

try {
  const sourcePackage = JSON.parse(readFileSync(join(repositoryRoot, "package.json"), "utf8"));
  const sourceLock = JSON.parse(readFileSync(join(repositoryRoot, "package-lock.json"), "utf8"));
  const lockedVersion = (packageName) => {
    const version = sourceLock.packages?.[`node_modules/${packageName}`]?.version;
    if (typeof version !== "string") {
      throw new Error(`Missing installed version for ${packageName} in package-lock.json.`);
    }
    return version;
  };

  const packOutput = JSON.parse(
    execFileSync(npm, ["pack", "--ignore-scripts", "--json", "--pack-destination", consumerRoot], {
      cwd: repositoryRoot,
      encoding: "utf8",
      shell: process.platform === "win32",
    }),
  );
  const packResult = Array.isArray(packOutput) ? packOutput[0] : Object.values(packOutput)[0];
  const tarball = join(consumerRoot, packResult.filename);

  writeFileSync(
    join(consumerRoot, "package.json"),
    JSON.stringify({
      name: "askr-themes-consumer",
      private: true,
      type: "module",
      dependencies: {
        "@askrjs/askr": lockedVersion("@askrjs/askr"),
        "@askrjs/ui": lockedVersion("@askrjs/ui"),
      },
    }),
  );
  execFileSync(npm, ["install", "--ignore-scripts", "--no-package-lock", tarball], {
    cwd: consumerRoot,
    stdio: "pipe",
    shell: process.platform === "win32",
  });
  writeFileSync(
    join(consumerRoot, "index.tsx"),
    [
      'import "@askrjs/themes";',
      'import "@askrjs/themes/default";',
      'import "@askrjs/themes/presets";',
      'import "@askrjs/themes/default/tokens.css";',
      'import "@askrjs/themes/default/foundations.css";',
      'import "@askrjs/themes/default/input.css";',
      'import "@askrjs/themes/default/label.css";',
      'import { Input, type InputProps } from "@askrjs/themes/input";',
      'import { Label, type LabelProps } from "@askrjs/themes/label";',
      'import { CommandPalette, CommandPaletteContent, CommandPaletteLink, CommandPaletteList, CommandPaletteTrigger, type CommandPaletteContentProps } from "@askrjs/themes/command";',
      'import "@askrjs/themes/templates/theme/index.css";',
      'import { Block, type BlockProps, type DialogProps, type GridProps, type SidebarRailProps, type TextProps } from "@askrjs/themes/components";',
      'import { withThemeStyles } from "@askrjs/themes/ssr";',
      "const fixture = <Block><span>strict consumer</span></Block>;",
      'const palette = <CommandPalette><CommandPaletteTrigger>Search</CommandPaletteTrigger><CommandPaletteContent title="Search docs"><CommandPaletteList><CommandPaletteLink href="/docs">Docs</CommandPaletteLink></CommandPaletteList></CommandPaletteContent></CommandPalette>;',
      'const paletteContent: CommandPaletteContentProps = { title: "Search docs" };',
      'const block: BlockProps = { padding: "md" };',
      "const grid: GridProps = { columns: 2 };",
      'const text: TextProps = { tone: "success" };',
      'const rail: SidebarRailProps = { type: "button" };',
      "void fixture; void palette; void paletteContent; void block; void grid; void text; void rail; void (null as DialogProps | InputProps | LabelProps | null); void Input; void Label; void withThemeStyles;",
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

  const typescriptCli = resolve(repositoryRoot, "node_modules/@typescript/native/bin/tsc");
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
      'const command = await import("@askrjs/themes/command");',
      'for (const name of ["Block", "ThemeScope"]) if (typeof (components[name] ?? theme[name]) !== "function") throw new Error(`Missing ${name}`);',
      'if (typeof ssr.withThemeStyles !== "function") throw new Error("Missing withThemeStyles");',
      'for (const name of ["CommandPalette", "CommandPaletteContent", "CommandPaletteLink", "CommandPaletteList", "CommandPaletteTrigger"]) if (typeof command[name] !== "function") throw new Error(`Missing ${name}`);',
    ].join("\n"),
  );
  execFileSync(process.execPath, [join(consumerRoot, "runtime.mjs")], {
    cwd: consumerRoot,
    stdio: "pipe",
  });

  const installedPackage = JSON.parse(
    readFileSync(join(consumerRoot, "node_modules/@askrjs/themes/package.json"), "utf8"),
  );
  if (installedPackage.version !== sourcePackage.version) {
    throw new Error(`Installed unexpected themes version ${installedPackage.version}.`);
  }
} finally {
  rmSync(consumerRoot, { recursive: true, force: true });
}
