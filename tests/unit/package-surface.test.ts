import { execFileSync } from "node:child_process";
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
import { ThemePicker, ThemeScope, ThemeToggle } from "../../src/theme";
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
const CSS_TYPE_TARGET = "./src/css.d.ts";
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
const COMPONENT_DIST_ARTIFACTS = ["dist/components.js", "dist/components.d.ts"] as const;
const WILDCARD_MODULE_BINDING = "*" as const;

function npmCommand(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function ensureComponentDistArtifacts(): void {
  const missingArtifacts = COMPONENT_DIST_ARTIFACTS.filter(
    (artifact) => !existsSync(join(ROOT_DIR, artifact)),
  );

  if (missingArtifacts.length === 0) {
    return;
  }

  execFileSync(npmCommand(), ["run", "build"], {
    cwd: ROOT_DIR,
    stdio: "ignore",
  });
}

function addNamedBindings(
  bindings: Set<string>,
  namedBindings: ts.NamedImportBindings | ts.NamedExportBindings | undefined,
): void {
  if (!namedBindings) {
    return;
  }

  if (ts.isNamespaceImport(namedBindings) || ts.isNamespaceExport(namedBindings)) {
    bindings.add(WILDCARD_MODULE_BINDING);
    return;
  }

  for (const element of namedBindings.elements) {
    bindings.add(element.propertyName?.text ?? element.name.text);
  }
}

function moduleBindingsFrom(
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
  const bindings = new Set<string>();

  sourceFile.forEachChild((node) => {
    if (
      !(
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text === moduleSpecifier
      )
    ) {
      return;
    }

    if (ts.isImportDeclaration(node)) {
      addNamedBindings(bindings, node.importClause?.namedBindings);
      return;
    }

    if (!node.exportClause) {
      bindings.add(WILDCARD_MODULE_BINDING);
      return;
    }

    addNamedBindings(bindings, node.exportClause);
  });

  return bindings;
}

function hasModuleBinding(bindings: ReadonlySet<string>, name: string): boolean {
  return bindings.has(name) || bindings.has(WILDCARD_MODULE_BINDING);
}

describe("package surface", () => {
  it("should exposes the shadcn-style component catalog from the aggregate entrypoint", () => {
    const namespace = components as Record<string, unknown>;

    for (const component of SHADCN_THEME_COMPONENTS) {
      expect(typeof namespace[component], component).toBe("function");
    }

    expect(namespace[SHADCN_CHART_COMPONENT]).toBeUndefined();
    expect(typeof ThemeScope).toBe("function");
    expect(typeof ThemePicker).toBe("function");
    expect(typeof ThemeToggle).toBe("function");
  });

  it("should publishes component subpaths and keeps charts out of themes", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    expect(pkg.exports?.["./components"]).toEqual(COMPONENT_EXPORT_TARGET);
    expect(pkg.exports?.["./theme"]).toBeTruthy();
    expect(pkg.exports?.["."]).toEqual({
      types: CSS_TYPE_TARGET,
      default: "./src/index.css",
    });
    expect(pkg.exports?.["./default"]).toEqual({
      types: CSS_TYPE_TARGET,
      default: "./src/themes/default/index.css",
    });
    expect(pkg.exports?.["./presets"]).toEqual({
      types: CSS_TYPE_TARGET,
      default: "./src/themes/presets/index.css",
    });
    expect(pkg.exports?.["./default/tokens.css"]).toEqual({
      types: CSS_TYPE_TARGET,
      default: "./src/themes/default/tokens.css",
    });
    expect(pkg.exports?.["./templates/*"]).toEqual({
      types: CSS_TYPE_TARGET,
      default: "./templates/*",
    });
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
    ensureComponentDistArtifacts();

    for (const artifact of COMPONENT_DIST_ARTIFACTS) {
      const artifactPath = join(ROOT_DIR, artifact);
      const source = readFileSync(artifactPath, "utf-8");
      const catalogBindings = moduleBindingsFrom(source, artifact, "./components/catalog.js");
      const uiBindings = moduleBindingsFrom(source, artifact, "@askrjs/ui");

      for (const component of REPORTED_CATALOG_WRAPPERS) {
        expect(
          hasModuleBinding(catalogBindings, component),
          `${artifact} should source ${component} from ./components/catalog.js`,
        ).toBe(true);
        expect(
          hasModuleBinding(uiBindings, component),
          `${artifact} should not source ${component} from @askrjs/ui`,
        ).toBe(false);
      }
    }
  });

  it("should keeps default CSS package exports pointed at real files", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    for (const [entrypoint, target] of Object.entries(pkg.exports ?? {})) {
      if (!entrypoint.startsWith("./default/") || typeof target !== "object" || !target) {
        continue;
      }

      const cssTarget = (target as { default?: string }).default;
      expect(typeof cssTarget).toBe("string");
      expect(
        existsSync(join(ROOT_DIR, cssTarget as string)),
        `${entrypoint} points at ${cssTarget}`,
      ).toBe(true);
    }
  });

  it("should keeps preset CSS package exports pointed at real files", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    const target = pkg.exports?.["./presets"];

    expect(typeof target).toBe("object");
    const cssTarget = (target as { default?: string }).default;
    expect(
      existsSync(join(ROOT_DIR, cssTarget as string)),
      `./presets points at ${cssTarget}`,
    ).toBe(true);
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
