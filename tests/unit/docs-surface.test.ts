import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

import { EXCLUDED_CHART_COMPONENT, THEME_COMPONENT_SUBPATHS } from "../../src/parity";
import { DOCS_DIR, PACKAGE_JSON, ROOT_DIR } from "./test-paths";

const README = join(ROOT_DIR, "README.md");
const THEMES_DOC = join(DOCS_DIR, "askr-themes.md");
const THEMING_DOC = join(DOCS_DIR, "theming.md");
const ARCHITECTURE_DOC = join(DOCS_DIR, "architecture.md");
const ACKNOWLEDGEMENTS = join(DOCS_DIR, "acknowledgements.md");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:css|ts|tsx)$/u.test(entry.name) ? [path] : [];
  });
}

describe("docs surface", () => {
  it("should document the component catalog package surface", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    expect(pkg.exports?.["./components"]).toBeTruthy();
    expect(pkg.exports?.["./theme"]).toBeTruthy();
    expect(pkg.exports?.["./core"]).toBeUndefined();
    expect(pkg.exports?.["./controls"]).toBeUndefined();
    expect(pkg.exports?.["./surfaces"]).toBeUndefined();
    expect(pkg.exports?.["./navs"]).toBeUndefined();
    expect(pkg.exports?.["./overlays"]).toBeUndefined();
  });

  it("should keep docs aligned with the new component catalog imports", () => {
    const docs = [
      readFileSync(README, "utf-8"),
      readFileSync(THEMES_DOC, "utf-8"),
      readFileSync(THEMING_DOC, "utf-8"),
      readFileSync(ARCHITECTURE_DOC, "utf-8"),
    ].join("\n");

    expect(docs).toContain("@askrjs/themes/components");
    expect(docs).toContain("@askrjs/themes/button");
    expect(docs).toContain("@askrjs/themes/card");
    expect(docs).toContain("@askrjs/themes/dialog");
    expect(docs).toContain("CommandPalette");
    expect(docs).toContain("@askrjs/charts");
    expect(docs).not.toContain("@askrjs/themes/core");
    expect(docs).not.toContain("@askrjs/themes/controls");
    expect(docs).not.toContain("@askrjs/themes/surfaces");
    expect(docs).not.toContain("@askrjs/themes/navs");
    expect(docs).not.toContain("@askrjs/themes/overlays");
  });

  it("should document catalog coverage without moving charts into themes", () => {
    const readme = readFileSync(README, "utf-8");
    const themingDoc = readFileSync(THEMING_DOC, "utf-8");

    expect(readme).toContain("styled component catalog");
    expect(themingDoc).toMatch(/Chart components stay\s+in `@askrjs\/charts`/);
    expect(THEME_COMPONENT_SUBPATHS).not.toContain("chart");
    expect(THEME_COMPONENT_SUBPATHS).not.toContain("charts");
    expect(EXCLUDED_CHART_COMPONENT).toBe("Chart");
  });

  it("should distinguish styling-only catalog compatibility names from behavior primitives", () => {
    const docs = [readFileSync(README, "utf-8"), readFileSync(ARCHITECTURE_DOC, "utf-8")]
      .join("\n")
      .replace(/\s+/gu, " ");

    expect(docs).toContain("Styling-only compatibility wrappers");
    expect(docs).toContain("DataTable");
    expect(docs).toContain("ResizablePanelGroup");
    expect(docs).toContain("does not sort, filter, select, or paginate");
    expect(docs).toContain("does not implement pointer or keyboard resizing");
    expect(docs).toContain("@askrjs/ui");
  });

  it("should keep external project attribution in acknowledgements, not source or tests", () => {
    const acknowledgements = readFileSync(ACKNOWLEDGEMENTS, "utf-8");
    const externalProjectNames = [...acknowledgements.matchAll(/^- \[([^\]]+)\]/gmu)].map(
      ([, name]) => name,
    );

    expect(externalProjectNames.length).toBeGreaterThan(0);
    for (const file of [
      ...sourceFiles(join(ROOT_DIR, "src")),
      ...sourceFiles(join(ROOT_DIR, "tests")),
    ]) {
      const source = readFileSync(file, "utf-8").toLowerCase();
      for (const projectName of externalProjectNames) {
        expect(source, file).not.toContain(projectName.toLowerCase());
      }
    }
  });
});
