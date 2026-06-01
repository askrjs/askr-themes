import { describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { DOCS_DIR, PACKAGE_JSON } from "./test-paths";

const THEMES_DOC = join(DOCS_DIR, "askr-themes.md");
const THEMING_DOC = join(DOCS_DIR, "theming.md");
const README_DOC = join(DOCS_DIR, "README.md");
const TOKENS_DOC = join(DOCS_DIR, "tokens.md");

describe("docs surface", () => {
  it("should documents curated entrypoints instead of a components catch-all", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    expect(pkg.exports?.["./theme"]).toBeTruthy();
    expect(pkg.exports?.["./layouts"]).toBeTruthy();
    expect(pkg.exports?.["./controls"]).toBeTruthy();
    expect(pkg.exports?.["./surfaces"]).toBeTruthy();
    expect(pkg.exports?.["./feedback"]).toBeTruthy();
    expect(pkg.exports?.["./shells"]).toBeTruthy();
    expect(pkg.exports?.["./navs"]).toBeTruthy();
    expect(pkg.exports?.["./overlays"]).toBeTruthy();
    expect(pkg.exports?.["./logos"]).toBeUndefined();
    expect(pkg.exports?.["./components"]).toBeUndefined();
  });

  it("should documents the same curated families and canonical names", () => {
    const themesDoc = readFileSync(THEMES_DOC, "utf-8");
    const themingDoc = readFileSync(THEMING_DOC, "utf-8");
    const readmeDoc = readFileSync(README_DOC, "utf-8");
    const tokensDoc = readFileSync(TOKENS_DOC, "utf-8");

    expect(themesDoc).toContain("## What askr-themes is");
    expect(themesDoc).toContain("## When to reach for what");
    expect(themesDoc).toContain("@askrjs/themes/theme");
    expect(themesDoc).toContain("@askrjs/themes/layouts");
    expect(themesDoc).toContain("@askrjs/themes/controls");
    expect(themesDoc).toContain("@askrjs/themes/surfaces");
    expect(themesDoc).toContain("@askrjs/themes/feedback");
    expect(themesDoc).toContain("@askrjs/themes/shells");
    expect(themesDoc).toContain("@askrjs/themes/navs");
    expect(themesDoc).toContain("@askrjs/themes/overlays");
    expect(themesDoc).not.toContain("@askrjs/themes/logos");
    expect(themesDoc).toContain("AspectRatio");
    expect(themesDoc).toContain("Alert");
    expect(themesDoc).toContain("ButtonGroup");
    expect(themesDoc).toContain("InputGroup");
    expect(themesDoc).toContain("Field");
    expect(themesDoc).toContain("ListGroup");
    expect(themesDoc).toContain("Pagination");
    expect(themesDoc).toContain("CardActions");
    expect(themesDoc).toContain("Header");
    expect(themesDoc).toContain("Breadcrumb");
    expect(themesDoc).toContain("Spinner");
    expect(themesDoc).toContain("Dropdown");
    expect(themesDoc).toContain("Menu");
    expect(themesDoc).toContain("Menubar");

    expect(themingDoc).toContain("## Selector Contract");
    expect(themingDoc).toContain("## Cat Presets");
    expect(themingDoc).toContain("@askrjs/themes/presets");
    expect(themingDoc).toContain("`tabby`");
    expect(themingDoc).toContain("`ginger`");
    expect(themingDoc).toContain("`tuxedo`");
    expect(themingDoc).toContain("`calico`");
    expect(themingDoc).toContain("`torty`");
    expect(themingDoc).toContain("theme`, `layouts`, `controls`, `surfaces`");
    expect(themingDoc).toContain("AspectRatio");
    expect(themingDoc).toContain("Alert");
    expect(themingDoc).toContain("ButtonGroup");
    expect(themingDoc).toContain("InputGroup");
    expect(themingDoc).toContain("Field");
    expect(themingDoc).toContain("ListGroup");
    expect(themingDoc).toContain("Pagination");
    expect(themingDoc).toContain("CardActions");
    expect(themingDoc).toContain("Header");
    expect(themingDoc).toContain("Breadcrumb");
    expect(themingDoc).toContain("Spinner");

    expect(readmeDoc).toContain("@askrjs/themes/navs");
    expect(readmeDoc).toContain("@askrjs/themes/surfaces");
    expect(readmeDoc).toContain("@askrjs/themes/feedback");
    expect(readmeDoc).toContain("@askrjs/themes/theme");
    expect(readmeDoc).toContain("@askrjs/themes/presets");
    expect(readmeDoc).toContain("@askrjs/themes/overlays");
    expect(readmeDoc).not.toContain("@askrjs/themes/logos");
    expect(readmeDoc).toContain("ButtonGroup");
    expect(readmeDoc).toContain("InputGroup");
    expect(readmeDoc).toContain("Field");
    expect(readmeDoc).toContain("Pagination");
    expect(readmeDoc).toContain("CardActions");
    expect(readmeDoc).toContain("DropdownItem asChild");

    expect(tokensDoc).toContain("## Semantic Registry");
    expect(tokensDoc).toContain("tabby");
    expect(tokensDoc).toContain("ginger");
    expect(tokensDoc).toContain("tuxedo");
    expect(tokensDoc).toContain("calico");
    expect(tokensDoc).toContain("torty");
    expect(tokensDoc).toContain("component-specific token");
    expect(tokensDoc).toContain("Color");
    expect(tokensDoc).toContain("Typography");
    expect(tokensDoc).toContain("Spacing");
    expect(tokensDoc).toContain("Density");
    expect(tokensDoc).toContain("Layout");
    expect(tokensDoc).toContain("Elevation");
    expect(tokensDoc).toContain("Focus");
    expect(tokensDoc).toContain("Motion");
    expect(tokensDoc).toContain("Z-index");
    expect(tokensDoc).toContain("State");
  });
});
