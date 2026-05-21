import { describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEFAULT_THEME_INDEX_FILE,
  DEFAULT_THEME_STYLES_DIR,
  TEMPLATE_THEME_INDEX_FILE,
  TEMPLATE_THEME_STYLES_DIR,
  THEMING_FILE,
} from "./test-paths";

const DEFAULT_RESPONSIVE_LAYOUT_FILE = join(
  DEFAULT_THEME_STYLES_DIR,
  "layout",
  "responsive-layout.css",
);
const DEFAULT_LAYOUT_FILE = join(DEFAULT_THEME_STYLES_DIR, "layout", "layout.css");
const TEMPLATE_RESPONSIVE_LAYOUT_FILE = join(
  TEMPLATE_THEME_STYLES_DIR,
  "layout",
  "responsive-layout.css",
);
const TEMPLATE_LAYOUT_FILE = join(TEMPLATE_THEME_STYLES_DIR, "layout", "layout.css");

const FORBIDDEN_LEGACY_IMPORTS = [
  "./styles/layout/sidebar.css",
  "./styles/layout/dashboard-layout.css",
  "./styles/layout/docs-layout.css",
] as const;

const REQUIRED_PATTERN_IMPORTS = [
  "./styles/layout/layout.css",
  "./styles/layout/responsive-layout.css",
  "./styles/layout/patterns.css",
] as const;

const REQUIRED_RESPONSIVE_SNIPPETS = [
  ':where([data-slot="shell"])',
  ':where([data-slot="shell"][data-variant="sidebar"])',
  ':where([data-slot="shell"][data-variant="sidebar"]) > :where([data-slot="shell-nav"])',
  ':where([data-slot="shell"][data-variant="rail"]) > :where([data-slot="shell-nav"])',
  ':where([data-slot="shell"][data-variant="topbar"]) > :where([data-slot="shell-nav"])',
  ':where([data-slot="shell"]) > :where([data-slot="shell-main"])',
  "@media (min-width: 40rem)",
  "@media (min-width: 48rem)",
  "@media (min-width: 64rem)",
  "@media (min-width: 80rem)",
] as const;

const REQUIRED_LAYOUT_SNIPPETS = [
  ':where([data-ak-layout="true"])',
  ':where([data-slot="container"])',
  "--ak-grid-template-columns-initial",
  "--ak-flex-direction-initial",
  "--ak-max-width-initial",
  "@media (min-width: 40rem)",
  "@media (min-width: 48rem)",
  "@media (min-width: 64rem)",
  "@media (min-width: 80rem)",
] as const;

const RESPONSIVE_IMPORT_PATTERN = /@import\s+['"]\.\/styles\/layout\/responsive-layout\.css['"];?/;

function read(relativePath: string): string {
  return readFileSync(relativePath, "utf8");
}

describe("responsive theme contract", () => {
  const defaultIndex = read(DEFAULT_THEME_INDEX_FILE);
  const templateIndex = read(TEMPLATE_THEME_INDEX_FILE);
  const defaultResponsive = read(DEFAULT_RESPONSIVE_LAYOUT_FILE);
  const defaultLayout = read(DEFAULT_LAYOUT_FILE);
  const templateResponsive = read(TEMPLATE_RESPONSIVE_LAYOUT_FILE);
  const templateLayout = read(TEMPLATE_LAYOUT_FILE);
  const theming = read(THEMING_FILE);
  const normalizedDefaultResponsive = defaultResponsive.replace(/'/g, '"');
  const normalizedDefaultLayout = defaultLayout.replace(/'/g, '"');

  it("keeps the default theme responsive layout contract in place", () => {
    expect(defaultIndex).toMatch(RESPONSIVE_IMPORT_PATTERN);

    for (const forbiddenImport of FORBIDDEN_LEGACY_IMPORTS) {
      expect(defaultIndex).not.toContain(forbiddenImport);
    }

    for (const requiredImport of REQUIRED_PATTERN_IMPORTS) {
      expect(defaultIndex).toContain(requiredImport);
    }

    for (const snippet of REQUIRED_RESPONSIVE_SNIPPETS) {
      expect(normalizedDefaultResponsive).toContain(snippet);
    }

    for (const snippet of REQUIRED_LAYOUT_SNIPPETS) {
      expect(normalizedDefaultLayout).toContain(snippet);
    }
  });

  it("keeps the generated theme template aligned with the default responsive layout contract", () => {
    expect(templateIndex).toMatch(RESPONSIVE_IMPORT_PATTERN);

    for (const forbiddenImport of FORBIDDEN_LEGACY_IMPORTS) {
      expect(templateIndex).not.toContain(forbiddenImport);
    }

    for (const requiredImport of REQUIRED_PATTERN_IMPORTS) {
      expect(templateIndex).toContain(requiredImport);
    }

    expect(templateResponsive).toBe(defaultResponsive);
    expect(templateLayout).toContain("Layout primitive contract placeholders");
  });

  it("documents responsive theming guidance", () => {
    const requiredDocs = [
      "Build mobile first.",
      "`sm`, `md`, `lg`, and `xl`",
      "`data-collapse-below`",
      "`data-min-item-width`",
      "`data-size`",
      "`:where(...)`",
    ] as const;

    for (const snippet of requiredDocs) {
      expect(theming).toContain(snippet);
    }
  });
});
