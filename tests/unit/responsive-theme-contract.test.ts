import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

import {
  DEFAULT_THEME_INDEX_FILE,
  DEFAULT_THEME_STYLES_DIR,
  TEMPLATE_THEME_INDEX_FILE,
  TEMPLATE_THEME_STYLES_DIR,
  THEMING_FILE,
} from "./test-paths";

const DEFAULT_LAYOUT_FILE = join(DEFAULT_THEME_STYLES_DIR, "layout", "layout.css");
const DEFAULT_NAVBAR_FILE = join(DEFAULT_THEME_STYLES_DIR, "shell", "navbar.css");
const TEMPLATE_LAYOUT_FILE = join(TEMPLATE_THEME_STYLES_DIR, "layout", "layout.css");
const TEMPLATE_NAVBAR_FILE = join(TEMPLATE_THEME_STYLES_DIR, "shell", "navbar.css");

const FORBIDDEN_LEGACY_IMPORTS = [
  "./styles/layout/responsive-layout.css",
  "./styles/layout/sidebar.css",
  "./styles/layout/dashboard-layout.css",
  "./styles/layout/docs-layout.css",
  "./styles/shell/theme.css",
] as const;

const REQUIRED_PATTERN_IMPORTS = [
  "./styles/layout/layout.css",
  "./styles/layout/block.css",
  "./styles/layout/patterns.css",
] as const;

const REQUIRED_LAYOUT_SNIPPETS = [
  ':where([data-ak-layout="true"])',
  "--ak-display-base",
  "--ak-flex-direction-base",
  "--ak-gap-base",
  "--ak-px-base",
  "--ak-max-width-base",
  "--ak-background-base",
  "--ak-border-bottom-base",
  "@media (min-width: 40rem)",
  "@media (min-width: 48rem)",
  "@media (min-width: 64rem)",
  "@media (min-width: 80rem)",
] as const;

const REQUIRED_NAVBAR_SNIPPETS = [
  '[data-slot="navbar"][data-collapse-at]',
  '[data-slot="navbar-collapse"]',
  '[data-slot="navbar-content"]',
  '[data-slot="navbar-toggle"]',
  '[data-slot="nav-dropdown-content"]',
  'data-collapse-at="sm"',
  "@media (min-width: 40rem)",
  'data-collapse-at="md"',
  "@media (min-width: 48rem)",
  'data-collapse-at="lg"',
  "@media (min-width: 64rem)",
  'data-collapse-at="xl"',
  "@media (min-width: 80rem)",
] as const;

function read(relativePath: string): string {
  return readFileSync(relativePath, "utf8");
}

describe("responsive theme contract", () => {
  const defaultIndex = read(DEFAULT_THEME_INDEX_FILE);
  const templateIndex = read(TEMPLATE_THEME_INDEX_FILE);
  const defaultLayout = read(DEFAULT_LAYOUT_FILE);
  const templateLayout = read(TEMPLATE_LAYOUT_FILE);
  const defaultNavbar = read(DEFAULT_NAVBAR_FILE);
  const templateNavbar = read(TEMPLATE_NAVBAR_FILE);
  const theming = read(THEMING_FILE);
  const normalizedDefaultLayout = defaultLayout.replace(/'/g, '"');
  const normalizedDefaultNavbar = defaultNavbar.replace(/'/g, '"');

  it("should keeps the default theme Block layout contract in place", () => {
    for (const forbiddenImport of FORBIDDEN_LEGACY_IMPORTS) {
      expect(defaultIndex).not.toContain(forbiddenImport);
    }

    for (const requiredImport of REQUIRED_PATTERN_IMPORTS) {
      expect(defaultIndex).toContain(requiredImport);
    }

    for (const snippet of REQUIRED_LAYOUT_SNIPPETS) {
      expect(normalizedDefaultLayout).toContain(snippet);
    }
  });

  it("should keeps the generated theme template aligned with the default layout contract", () => {
    for (const forbiddenImport of FORBIDDEN_LEGACY_IMPORTS) {
      expect(templateIndex).not.toContain(forbiddenImport);
    }

    for (const requiredImport of REQUIRED_PATTERN_IMPORTS) {
      expect(templateIndex).toContain(requiredImport);
    }

    expect(templateLayout).toBe(defaultLayout);
  });

  it("should keeps the Navbar responsive contract in the default theme", () => {
    for (const snippet of REQUIRED_NAVBAR_SNIPPETS) {
      expect(normalizedDefaultNavbar).toContain(snippet);
    }
  });

  it("should keeps the generated theme template aligned with the default Navbar contract", () => {
    expect(templateNavbar).toBe(defaultNavbar);
  });

  it("should applies static utilities after the Block layout engine", () => {
    expect(defaultIndex.indexOf("./styles/layout/layout.css")).toBeLessThan(
      defaultIndex.indexOf("./styles/base/utilities.css"),
    );
    expect(templateIndex.indexOf("./styles/layout/layout.css")).toBeLessThan(
      templateIndex.indexOf("./styles/base/utilities.css"),
    );
  });

  it("should documents responsive theming guidance", () => {
    const requiredDocs = [
      "Build mobile first.",
      "`base`, `sm`, `md`, `lg`, and `xl`",
      "`Block`",
      "`:where(...)`",
    ] as const;

    for (const snippet of requiredDocs) {
      expect(theming).toContain(snippet);
    }
  });
});
