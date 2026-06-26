import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

import { DOCS_DIR, DEFAULT_THEME_STYLES_DIR, ROOT_DIR, THEMING_FILE } from "./test-paths";

const VISUAL_CHECK_FILE = join(ROOT_DIR, "visual-check.html");
const DOCS_README_FILE = join(DOCS_DIR, "README.md");
const DOCS_THEMING_FILE = join(DOCS_DIR, "theming.md");
const DOCS_OVERVIEW_FILE = join(DOCS_DIR, "askr-themes.md");
const BUTTON_CSS_FILE = join(DEFAULT_THEME_STYLES_DIR, "actions", "button.css");
const INPUT_CSS_FILE = join(DEFAULT_THEME_STYLES_DIR, "forms", "input.css");
const CARD_CSS_FILE = join(DEFAULT_THEME_STYLES_DIR, "display", "card.css");
const CATALOG_CSS_FILE = join(DEFAULT_THEME_STYLES_DIR, "display", "catalog.css");
const TABLE_CSS_FILE = join(DEFAULT_THEME_STYLES_DIR, "display", "table.css");
const BLOCK_CSS_FILE = join(DEFAULT_THEME_STYLES_DIR, "layout", "block.css");
const HEADER_CSS_FILE = join(DEFAULT_THEME_STYLES_DIR, "shell", "header.css");
const NAVBAR_CSS_FILE = join(DEFAULT_THEME_STYLES_DIR, "shell", "navbar.css");
const DROPDOWN_CSS_FILE = join(DEFAULT_THEME_STYLES_DIR, "overlays", "dropdown.css");
const TOOLTIP_CSS_FILE = join(DEFAULT_THEME_STYLES_DIR, "overlays", "tooltip.css");

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("visual quality contract", () => {
  const visualCheck = read(VISUAL_CHECK_FILE);
  const rootTheming = read(THEMING_FILE);
  const docsReadme = read(DOCS_README_FILE);
  const docsTheming = read(DOCS_THEMING_FILE);
  const docsOverview = read(DOCS_OVERVIEW_FILE);
  const buttonCss = read(BUTTON_CSS_FILE);
  const inputCss = read(INPUT_CSS_FILE);
  const cardCss = read(CARD_CSS_FILE);
  const catalogCss = read(CATALOG_CSS_FILE);
  const tableCss = read(TABLE_CSS_FILE);
  const blockCss = read(BLOCK_CSS_FILE);
  const headerCss = read(HEADER_CSS_FILE);
  const navbarCss = read(NAVBAR_CSS_FILE);
  const dropdownCss = read(DROPDOWN_CSS_FILE);
  const tooltipCss = read(TOOLTIP_CSS_FILE);

  it("should keeps the manual audit page broad enough for polish work", () => {
    const requiredAuditCopy = [
      "Component audit, one family at a time.",
      "Quality checklist",
      "Typography and status",
      "Resilience states",
      "Responsive composition",
      "Mobile stress",
      "Supporting primitives",
      "Overlays",
      "Light mode",
      "Dark mode",
    ] as const;

    for (const snippet of requiredAuditCopy) {
      expect(visualCheck).toContain(snippet);
    }

    expect(visualCheck).toContain("No clipped text");
    expect(visualCheck).toContain("Dense SaaS compositions");
    expect(visualCheck).toContain('data-theme="dark"');
  });

  it("should documents the visual audit standard and responsive widths", () => {
    const requiredDocs = [
      "Visual Quality Standard",
      "visual-check.html",
      "`320`, `390`, `768`, `1024`, and desktop widths",
      "No clipped text",
      "Dark mode has equal",
      "Dense SaaS",
      "Template Sync",
    ] as const;

    for (const snippet of requiredDocs) {
      expect(rootTheming).toContain(snippet);
      expect(docsTheming).toContain(snippet);
    }

    expect(docsReadme).toContain("Visual Quality");
    expect(docsReadme).toContain("visual-check.html");
    expect(docsOverview).toContain("product and admin");
    expect(docsOverview).toContain("[Theming](./theming.md)");
  });

  it("should documents that default theme CSS and templates move together", () => {
    const requiredTemplateSync = [
      "src/themes/default/styles",
      "templates/theme/styles",
      "same change",
      "intentionally different",
      ":where(...)",
      "public `data-slot` hooks",
      "selector contract tests",
    ] as const;

    for (const snippet of requiredTemplateSync) {
      expect(docsTheming).toContain(snippet);
    }

    expect(rootTheming).toContain("Template Sync");
    expect(rootTheming).toContain("templates/theme/styles");
  });

  it("should keep shared primitives visually aligned with shadcn generated defaults", () => {
    expect(buttonCss).toContain("--_button-height: var(--ak-density-control-height-md);");
    expect(buttonCss).toContain("background: var(--ak-color-primary);");
    expect(buttonCss).toContain("font-weight: var(--ak-font-weight-medium);");
    expect(buttonCss).toContain("box-shadow: 0 0 0 var(--ak-focus-ring-width)");
    expect(buttonCss).toContain("opacity: 0.5;");

    expect(inputCss).toContain("min-height: var(--_input-height);");
    expect(inputCss).toContain("background: transparent;");
    expect(inputCss).toContain("box-shadow: var(--ak-shadow-xs);");

    expect(cardCss).toContain("gap: var(--ak-space-6);");
    expect(cardCss).toContain("padding: var(--ak-space-6) 0;");

    expect(dropdownCss).toContain("--_dropdown-surface: var(--ak-color-popover);");
    expect(dropdownCss).toContain("min-height: 2rem;");

    expect(tooltipCss).toContain("--_tooltip-surface: var(--ak-color-primary);");
    expect(tooltipCss).toContain("font-size: var(--ak-font-size-xs);");
  });

  it("should keep plain app shells polished without app-local CSS", () => {
    expect(headerCss).toContain("background: color-mix(in srgb, var(--ak-color-bg) 92%, transparent);");
    expect(headerCss).toContain("backdrop-filter: blur(12px);");
    expect(navbarCss).toContain("min-block-size: var(--ak-layout-navbar-height);");
    expect(navbarCss).toContain("grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);");
    expect(navbarCss).toContain("justify-self: center;");
    expect(navbarCss).toContain('[data-slot="navbar"] [data-slot="nav-group-body"]');
    expect(navbarCss).toContain('[data-slot="nav-group"][data-align="end"]');

    expect(blockCss).toContain('[data-slot="page-header-copy"]');
    expect(blockCss).toContain("max-inline-size: 48rem;");
    expect(blockCss).toContain("text-wrap: pretty;");

    expect(cardCss).toContain("overflow: hidden;");
    expect(cardCss).toContain("box-shadow: var(--ak-shadow-md);");
    expect(catalogCss).toContain('[data-slot="card-action"]');
    expect(catalogCss).toContain("grid-template-columns: 1fr;");
    expect(catalogCss).toContain("inline-size: 2rem;");

    expect(tableCss).toContain('[data-slot="data-table"]');
    expect(tableCss).toContain("background: var(--ak-color-surface-muted);");
    expect(tableCss).toContain('[data-slot="table-row"]:last-child');
  });
});
