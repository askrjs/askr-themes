import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  // Themes declarations use the scoped Askr JSX namespace and must not add globals.
  const installedPackageRoot = join(consumerRoot, "node_modules/@askrjs/themes");
  const globalJsxLeaks = [];
  const scanDeclarations = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules") scanDeclarations(entryPath);
      } else if (/\.d\.[cm]?ts$/.test(entry.name)) {
        const source = readFileSync(entryPath, "utf8");
        if (/\bdeclare\s+global\b/.test(source) || /\bnamespace\s+JSX\b/.test(source)) {
          const packagePath = entryPath
            .slice(installedPackageRoot.length + 1)
            .replaceAll("\\", "/");
          globalJsxLeaks.push(packagePath);
        }
      }
    }
  };
  scanDeclarations(installedPackageRoot);
  if (globalJsxLeaks.length > 0) {
    throw new Error(
      `Unexpected ambient JSX declarations in Themes:\n  ${globalJsxLeaks.join("\n  ")}`,
    );
  }

  const granularEntries = readdirSync(join(installedPackageRoot, "dist/entries"))
    .filter((name) => name.endsWith(".d.ts"))
    .map((name) => name.slice(0, -".d.ts".length));
  if (granularEntries.length === 0) {
    throw new Error("Expected granular entry declarations in the installed package.");
  }

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
      'import { CommandInput } from "@askrjs/themes/command";',
      'import { NativeSelect } from "@askrjs/themes/native-select";',
      'import { CarouselPrevious } from "@askrjs/themes/carousel";',
      'import { Label, type LabelProps } from "@askrjs/themes/label";',
      'import { Block as GranularBlock } from "@askrjs/themes/block";',
      'import { Center as GranularCenter } from "@askrjs/themes/center";',
      'import { Cluster as GranularCluster } from "@askrjs/themes/cluster";',
      'import { Container as GranularContainer } from "@askrjs/themes/container";',
      'import { Grid as GranularGrid } from "@askrjs/themes/grid";',
      'import { Page as GranularPage } from "@askrjs/themes/page";',
      'import { PageHeader as GranularPageHeader } from "@askrjs/themes/page-header";',
      'import { Section as GranularSection } from "@askrjs/themes/section";',
      'import { Text as GranularText } from "@askrjs/themes/text";',
      'import { Stack as GranularStack } from "@askrjs/themes/stack";',
      'import { CommandPalette, CommandPaletteContent, CommandPaletteLink, CommandPaletteList, CommandPaletteTrigger, type CommandPaletteContentProps } from "@askrjs/themes/command";',
      'import "@askrjs/themes/templates/theme/index.css";',
      'import { Block, Heading, PageHeader, Stack, Toolbar, type BlockProps, type DialogProps, type GridProps, type HeadingProps, type SidebarRailProps, type TextProps } from "@askrjs/themes/components";',
      'import { withThemeStyles } from "@askrjs/themes/ssr";',
      'import type { JSX as AskrJSX } from "@askrjs/askr/jsx-runtime";',
      "const scopedElement: AskrJSX.Element = <Block><Heading level={2}>Scoped</Heading></Block>;",
      'const scopedComponentResult: AskrJSX.Element = Block({ children: "scoped" });',
      "void scopedElement; void scopedComponentResult;",
      "const fixture = <Block><span>strict consumer</span></Block>;",
      'const granular = <GranularPage><GranularPageHeader title="Status" /><GranularContainer><GranularSection><GranularStack gap="sm"><GranularCenter minHeight="sm"><GranularText>one</GranularText></GranularCenter><GranularCluster gap="xs"><GranularText>two</GranularText></GranularCluster><GranularGrid columns={2}><GranularBlock /><GranularBlock /></GranularGrid></GranularStack></GranularSection></GranularContainer></GranularPage>;',
      'const palette = <CommandPalette><CommandPaletteTrigger>Search</CommandPaletteTrigger><CommandPaletteContent title="Search docs"><CommandPaletteList><CommandPaletteLink href="/docs">Docs</CommandPaletteLink></CommandPaletteList></CommandPaletteContent></CommandPalette>;',
      'const paletteContent: CommandPaletteContentProps = { title: "Search docs" };',
      'declare const inputRef: import("@askrjs/askr/foundations/utilities").Ref<HTMLInputElement>;',
      'declare const selectRef: import("@askrjs/askr/foundations/utilities").Ref<HTMLSelectElement>;',
      'declare const buttonRef: import("@askrjs/askr/foundations/utilities").Ref<HTMLButtonElement>;',
      "const inputWithRef = <CommandInput ref={inputRef} />;",
      "const selectWithRef = <NativeSelect ref={selectRef} />;",
      "const buttonWithRef = <CarouselPrevious ref={buttonRef} />;",
      "// @ts-expect-error CommandInput forwards refs to an input element.",
      "const commandWithWrongRef = <CommandInput ref={selectRef} />;",
      "// @ts-expect-error NativeSelect forwards refs to a select element.",
      "const selectWithWrongRef = <NativeSelect ref={inputRef} />;",
      'const block: BlockProps = { padding: "md", wrap: { base: true, md: false } };',
      "const wrapped = <Block wrap><span>wrapped</span></Block>;",
      "// @ts-expect-error wrap accepts only booleans or responsive booleans",
      'const invalidWrap = <Block wrap="yes" />;',
      "// @ts-expect-error rowFrom and direction are mutually exclusive",
      'const invalidDirectionContract = <Block rowFrom="md" direction="row" />;',
      "// @ts-expect-error Toolbar owns its responsive axis",
      'const invalidToolbarDirection = <Toolbar title="Title" direction="row" />;',
      "// @ts-expect-error PageHeader owns its responsive axis",
      'const invalidPageHeaderRowFrom = <PageHeader title="Title" rowFrom="lg" />;',
      "const grid: GridProps = { columns: 2 };",
      'const text: TextProps = { tone: "success" };',
      'const heading = <Heading level={1} size="3xl" id="overview">Overview</Heading>;',
      'const headingProps: HeadingProps = { level: 2, children: "Details", "aria-label": "Details" };',
      "// @ts-expect-error Heading requires an explicit semantic level",
      "const missingHeadingLevel = <Heading>Missing level</Heading>;",
      "// @ts-expect-error Heading levels are restricted to native h1 through h6",
      "const invalidHeadingLevel = <Heading level={7}>Invalid</Heading>;",
      'const rail: SidebarRailProps = { type: "button" };',
      "void fixture; void granular; void palette; void paletteContent; void inputWithRef; void selectWithRef; void buttonWithRef; void commandWithWrongRef; void selectWithWrongRef; void block; void wrapped; void invalidWrap; void invalidDirectionContract; void invalidToolbarDirection; void invalidPageHeaderRowFrom; void grid; void text; void heading; void headingProps; void missingHeadingLevel; void invalidHeadingLevel; void rail; void (null as DialogProps | InputProps | LabelProps | null); void Input; void Label; void withThemeStyles;",
      // Load every granular entry declaration so strict lib checking catches
      // any emitted reference to a JSX namespace that is not imported.
      ...granularEntries.map(
        (entry, index) => `import type * as GranularEntry${index} from "@askrjs/themes/${entry}";`,
      ),
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
      include: ["index.tsx", "public-surface.fixture.tsx"],
    }),
  );

  writeFileSync(
    join(consumerRoot, "public-surface.fixture.tsx"),
    readFileSync(join(repositoryRoot, "tests/types/public-surface.fixture.tsx")),
  );
  const compilers = ["typescript", "@typescript/native"].map((alias) => {
    const compilerRoot = resolve(repositoryRoot, "node_modules", alias);
    const manifest = JSON.parse(readFileSync(join(compilerRoot, "package.json"), "utf8"));
    return { alias, cli: resolve(compilerRoot, Object.values(manifest.bin)[0]) };
  });
  function compile(config) {
    for (const compiler of compilers) {
      const version = execFileSync(process.execPath, [compiler.cli, "--version"], {
        encoding: "utf8",
      }).trim();
      console.log(`${compiler.alias}: ${version}`);
      execFileSync(process.execPath, [compiler.cli, "-p", join(consumerRoot, config)], {
        cwd: consumerRoot,
        stdio: "inherit",
      });
    }
  }
  compile("tsconfig.json");

  // Check the aggregate entry alone as well as the complete declaration graph.
  writeFileSync(
    join(consumerRoot, "jsx-compatibility.tsx"),
    [
      'import { Block } from "@askrjs/themes/components";',
      'import type { JSX as AskrJSX } from "@askrjs/askr/jsx-runtime";',
      'const scopedResult: AskrJSX.Element = Block({ children: "scoped" });',
      "// @ts-expect-error The Themes aggregate does not install an ambient JSX namespace.",
      "type RetiredGlobal = JSX.Element;",
      "void scopedResult;",
    ].join("\n"),
  );
  writeFileSync(
    join(consumerRoot, "jsx-compatibility.tsconfig.json"),
    JSON.stringify({ extends: "./tsconfig.json", include: ["jsx-compatibility.tsx"] }),
  );
  compile("jsx-compatibility.tsconfig.json");

  for (const file of ["public-surface.json", "installed-runtime.mjs"]) {
    writeFileSync(
      join(consumerRoot, file),
      readFileSync(join(repositoryRoot, "tests/fixtures", file)),
    );
  }
  execFileSync(process.execPath, [join(consumerRoot, "installed-runtime.mjs")], {
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
