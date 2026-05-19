import { join } from "node:path";

export const ROOT_DIR = join(__dirname, "..", "..");
export const SRC_DIR = join(ROOT_DIR, "src");
export const THEMES_DIR = join(SRC_DIR, "themes");

export const DEFAULT_THEME_DIR = join(THEMES_DIR, "default");
export const DEFAULT_THEME_STYLES_DIR = join(DEFAULT_THEME_DIR, "styles");
export const DEFAULT_THEME_INDEX_FILE = join(DEFAULT_THEME_DIR, "index.css");
export const DEFAULT_THEME_TOKENS_FILE = join(DEFAULT_THEME_DIR, "tokens.css");
export const DEFAULT_ICON_CSS = join(DEFAULT_THEME_STYLES_DIR, "base", "icon.css");

export const TEMPLATE_THEME_DIR = join(ROOT_DIR, "templates", "theme");
export const TEMPLATE_THEME_STYLES_DIR = join(TEMPLATE_THEME_DIR, "styles");
export const TEMPLATE_THEME_INDEX_FILE = join(TEMPLATE_THEME_DIR, "index.css");
export const TEMPLATE_THEME_TOKENS_FILE = join(TEMPLATE_THEME_DIR, "tokens.css");
export const TEMPLATE_ICON_CSS = join(TEMPLATE_THEME_STYLES_DIR, "base", "icon.css");

export const DOCS_DIR = join(ROOT_DIR, "docs");
export const THEMING_FILE = join(ROOT_DIR, "THEMING.md");
export const PACKAGE_JSON = join(ROOT_DIR, "package.json");
