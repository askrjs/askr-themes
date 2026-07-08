import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as ts from "typescript";
import { describe, expect, it } from "vite-plus/test";

import * as components from "../../src/components";
import {
  SHADCN_CHART_COMPONENT,
  SHADCN_THEME_COMPONENT_SUBPATHS,
  SHADCN_THEME_COMPONENTS,
} from "../../src/parity";
import { ThemePicker, ThemeProvider, ThemeToggle } from "../../src/theme";
import {
  DEFAULT_THEME_INDEX_FILE,
  PACKAGE_JSON,
  ROOT_DIR,
  TEMPLATE_THEME_INDEX_FILE,
} from "./test-paths";

const DEFAULT_INDEX = DEFAULT_THEME_INDEX_FILE;
const TEMPLATE_INDEX = TEMPLATE_THEME_INDEX_FILE;
const COMPONENT_EXPORT_TARGET = {
  types: "./dist/components.d.ts",
  import: "./dist/components.js",
};
const REMOVED_FAMILY_EXPORTS = [
  "./controls",
  "./core",
  "./feedback",
  "./layouts",
  "./navs",
  "./overlays",
  "./shells",
  "./surfaces",
] as const;
const A11Y_EXPORT_PATTERN = new RegExp(
  `${["A11Y", "CONTRACT"].join("_")}|${["A11y", "Contract"].join("")}`,
);
const REPORTED_CATALOG_WRAPPERS = [
  "DataTable",
  "ResizablePanelGroup",
  "ResizablePanel",
  "ResizableHandle",
] as const;
const COMPONENT_DIST_ARTIFACTS = [
  "dist/components.js",
  "dist/components.d.ts",
] as const;

function namedImportsFrom(
  source: string,
  fileName: string,
  moduleSpecifier: string,
): Set<string> {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith(".js") ? ts.ScriptKind.JS : ts.ScriptKind.TS,
  );
  const imports = new Set<string>();

  sourceFile.forEachChild((node) => {
    if (!ts.isImportDeclaration(node)) {
      return;
    }

    if (
      !ts.isStringLiteral(node.moduleSpecifier) ||
      node.moduleSpecifier.text !== moduleSpecifier
    ) {
      return;
    }

    const namedBindings = node.importClause?.namedBindings;
    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      return;
    }

    for (const element of namedBindings.elements) {
      imports.add(element.propertyName?.text ?? element.name.text);
    }
  });

  return imports;
}

describe("package surface", () => {
  it("should exposes the shadcn-style component catalog from the aggregate entrypoint", () => {
    const namespace = components as Record<string, unknown>;

    for (const component of SHADCN_THEME_COMPONENTS) {
      expect(typeof namespace[component], component).toBe("function");
    }

    expect(namespace[SHADCN_CHART_COMPONENT]).toBeUndefined();
    expect(typeof ThemeProvider).toBe("function");
    expect(typeof ThemePicker).toBe("function");
    expect(typeof ThemeToggle).toBe("function");
  });

  it("should publishes component subpaths and keeps charts out of themes", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    expect(pkg.exports?.["./components"]).toEqual(COMPONENT_EXPORT_TARGET);
    expect(pkg.exports?.["./theme"]).toBeTruthy();
    expect(pkg.exports?.["./default"]).toBe("./src/themes/default/index.css");
    expect(pkg.exports?.["./presets"]).toBe("./src/themes/presets/index.css");
    expect(pkg.exports?.["./chart"]).toBeUndefined();
    expect(pkg.exports?.["./charts"]).toBeUndefined();

    for (const subpath of SHADCN_THEME_COMPONENT_SUBPATHS) {
      expect(pkg.exports?.[`./${subpath}`], subpath).toEqual(COMPONENT_EXPORT_TARGET);
    }

    for (const entrypoint of REMOVED_FAMILY_EXPORTS) {
      expect(pkg.exports?.[entrypoint], entrypoint).toBeUndefined();
    }
  });

  it("should keeps accessibility contracts out of app-facing barrels", () => {
    const barrels = [
      "src/components.ts",
      "src/theme.ts",
      "src/components/badge/index.ts",
      "src/components/block/index.ts",
      "src/components/card/index.ts",
      "src/components/catalog.tsx",
      "src/components/separator/index.ts",
      "src/components/skeleton/index.ts",
    ];

    for (const barrel of barrels) {
      const source = readFileSync(join(ROOT_DIR, barrel), "utf-8");

      expect(source, `${barrel} should not re-export internal contract details`).not.toMatch(
        A11Y_EXPORT_PATTERN,
      );
    }
  });

  it("should keeps reported catalog wrappers sourced from the built catalog artifacts", () => {
    for (const artifact of COMPONENT_DIST_ARTIFACTS) {
      const artifactPath = join(ROOT_DIR, artifact);
      const source = readFileSync(artifactPath, "utf-8");
      const catalogImports = namedImportsFrom(
        source,
        artifact,
        "./components/catalog.js",
      );
      const uiImports = namedImportsFrom(
        source,
        artifact,
        "@askrjs/ui",
      );

      for (const component of REPORTED_CATALOG_WRAPPERS) {
        expect(
          catalogImports.has(component),
          `${artifact} should import ${component} from ./components/catalog.js`,
        ).toBe(true);
        expect(
          uiImports.has(component),
          `${artifact} should not import ${component} from @askrjs/ui`,
        ).toBe(false);
      }
    }
  });

  it("should keeps default CSS package exports pointed at real files", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    for (const [entrypoint, target] of Object.entries(pkg.exports ?? {})) {
      if (!entrypoint.startsWith("./default/") || typeof target !== "string") {
        continue;
      }

      expect(existsSync(join(ROOT_DIR, target)), `${entrypoint} points at ${target}`).toBe(true);
    }
  });

  it("should keeps preset CSS package exports pointed at real files", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    const target = pkg.exports?.["./presets"];

    expect(typeof target).toBe("string");
    expect(existsSync(join(ROOT_DIR, target as string)), `./presets points at ${target}`).toBe(
      true,
    );
  });

  it("should keeps recipe layout imports out of the shipped theme CSS", () => {
    const defaultIndex = readFileSync(DEFAULT_INDEX, "utf-8");
    const templateIndex = readFileSync(TEMPLATE_INDEX, "utf-8");

    for (const source of [defaultIndex, templateIndex]) {
      expect(source).not.toContain("marketing-shell.css");
      expect(source).not.toContain("product-shell.css");
    }
  });
});
