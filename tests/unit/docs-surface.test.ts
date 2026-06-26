import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

import {
  SHADCN_CHART_COMPONENT,
  SHADCN_THEME_COMPONENT_SUBPATHS,
} from "../../src/parity";
import { DOCS_DIR, PACKAGE_JSON, ROOT_DIR } from "./test-paths";

const README = join(ROOT_DIR, "README.md");
const THEMES_DOC = join(DOCS_DIR, "askr-themes.md");
const THEMING_DOC = join(DOCS_DIR, "theming.md");
const ARCHITECTURE_DOC = join(DOCS_DIR, "architecture.md");

describe("docs surface", () => {
  it("should documents the component catalog package surface", () => {
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

  it("should keeps docs aligned with the new component catalog imports", () => {
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
    expect(docs).toContain("@askrjs/charts");
    expect(docs).not.toContain("@askrjs/themes/core");
    expect(docs).not.toContain("@askrjs/themes/controls");
    expect(docs).not.toContain("@askrjs/themes/surfaces");
    expect(docs).not.toContain("@askrjs/themes/navs");
    expect(docs).not.toContain("@askrjs/themes/overlays");
  });

  it("should documents non-chart shadcn parity without moving charts into themes", () => {
    const readme = readFileSync(README, "utf-8");
    const themingDoc = readFileSync(THEMING_DOC, "utf-8");

    expect(readme).toContain("shadcn-style");
    expect(themingDoc).toMatch(/Chart components stay\s+in `@askrjs\/charts`/);
    expect(SHADCN_THEME_COMPONENT_SUBPATHS).not.toContain("chart");
    expect(SHADCN_THEME_COMPONENT_SUBPATHS).not.toContain("charts");
    expect(SHADCN_CHART_COMPONENT).toBe("Chart");
  });
});
