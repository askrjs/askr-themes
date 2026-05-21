import { describe, it, expect } from "vite-plus/test";
import { readdirSync, existsSync, readFileSync, type Dirent } from "node:fs";
import { join } from "node:path";

import {
  DEFAULT_THEME_INDEX_FILE,
  DEFAULT_THEME_STYLES_DIR,
  DEFAULT_THEME_TOKENS_FILE,
  TEMPLATE_THEME_INDEX_FILE,
  TEMPLATE_THEME_STYLES_DIR,
  TEMPLATE_THEME_TOKENS_FILE,
  THEMES_DIR,
} from "./test-paths";

const DEFAULT_COMPONENTS = DEFAULT_THEME_STYLES_DIR;
const TEMPLATE_COMPONENTS = TEMPLATE_THEME_STYLES_DIR;
const DEFAULT_INDEX = DEFAULT_THEME_INDEX_FILE;
const TEMPLATE_INDEX = TEMPLATE_THEME_INDEX_FILE;
const DEFAULT_TOKENS = DEFAULT_THEME_TOKENS_FILE;
const TEMPLATE_TOKENS = TEMPLATE_THEME_TOKENS_FILE;

function listCssFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];

  function collect(currentDir: string, relativeDir = ""): string[] {
    return readdirSync(currentDir, { withFileTypes: true }).flatMap((entry: Dirent) => {
      const entryPath = join(currentDir, entry.name);
      const relativePath = relativeDir ? join(relativeDir, entry.name) : entry.name;

      if (entry.isDirectory()) {
        return collect(entryPath, relativePath);
      }

      return entry.name.endsWith(".css") ? [relativePath] : [];
    });
  }

  return collect(dir).sort();
}

function extractTokenNames(css: string): string[] {
  return [...css.matchAll(/(--ak-[a-z0-9-]+)\b/g)]
    .map((match) => match[1])
    .filter((token, index, all) => all.indexOf(token) === index)
    .sort();
}

describe("template parity", () => {
  const defaultFiles = listCssFiles(DEFAULT_COMPONENTS);
  const templateFiles = listCssFiles(TEMPLATE_COMPONENTS);

  it("should find default theme component files", () => {
    expect(defaultFiles.length).toBeGreaterThan(0);
  });

  it("should find template component files", () => {
    expect(templateFiles.length).toBeGreaterThan(0);
  });

  it("template covers every component in the default theme", () => {
    const missingInTemplate = defaultFiles.filter((f) => !templateFiles.includes(f));
    expect(
      missingInTemplate,
      `Default theme has components missing from template: ${missingInTemplate.join(", ")}`,
    ).toEqual([]);
  });

  it("template has no extra files not in the default theme", () => {
    const extraInTemplate = templateFiles.filter((f) => !defaultFiles.includes(f));
    expect(
      extraInTemplate,
      `Template has extra components not in default theme: ${extraInTemplate.join(", ")}`,
    ).toEqual([]);
  });

  it("template tokens expose the same canonical token names as the default theme", () => {
    const defaultTokens = extractTokenNames(readFileSync(DEFAULT_TOKENS, "utf-8"));
    const templateTokens = extractTokenNames(readFileSync(TEMPLATE_TOKENS, "utf-8"));

    expect(templateTokens).toEqual(defaultTokens);
  });

  it("template entrypoint imports the same component CSS as the default theme", () => {
    expect(readFileSync(TEMPLATE_INDEX, "utf-8")).toEqual(readFileSync(DEFAULT_INDEX, "utf-8"));
  });

  it("template keeps Nav and Navbar styles aligned with the default theme", () => {
    const navFiles = ["navigation/nav.css", "shell/navbar.css"];

    for (const file of navFiles) {
      expect(
        readFileSync(join(TEMPLATE_COMPONENTS, file), "utf-8"),
        `${file} drifted from the default theme`,
      ).toEqual(readFileSync(join(DEFAULT_COMPONENTS, file), "utf-8"));
    }
  });

  it("official theme entrypoints use the same canonical layout imports", () => {
    const themeNames = readdirSync(THEMES_DIR).filter(
      (entry) => entry !== "presets" && existsSync(join(THEMES_DIR, entry, "index.css")),
    );

    const importsByTheme = new Map<string, string[]>();
    for (const theme of themeNames) {
      const css = readFileSync(join(THEMES_DIR, theme, "index.css"), "utf-8");
      const imports = css
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("@import "));
      importsByTheme.set(theme, imports);
    }

    const defaultImports = importsByTheme.get("default") ?? [];
    for (const [theme, imports] of importsByTheme) {
      expect(imports, `${theme} theme imports drift from default`).toEqual(defaultImports);
    }
  });

  it("official theme token files keep the same canonical token names as default", () => {
    const themeNames = readdirSync(THEMES_DIR).filter((entry) =>
      existsSync(join(THEMES_DIR, entry, "tokens.css")),
    );
    const defaultTokens = extractTokenNames(readFileSync(DEFAULT_TOKENS, "utf-8"));

    for (const theme of themeNames) {
      const themeTokens = extractTokenNames(
        readFileSync(join(THEMES_DIR, theme, "tokens.css"), "utf-8"),
      );

      expect(themeTokens, `${theme} theme token definitions drift from default`).toEqual(
        defaultTokens,
      );
    }
  });

  it("official theme component directories keep the same canonical files as default", () => {
    const themeNames = readdirSync(THEMES_DIR).filter((entry) =>
      existsSync(join(THEMES_DIR, entry, "components")),
    );

    for (const theme of themeNames) {
      const themeFiles = listCssFiles(join(THEMES_DIR, theme, "components"));
      expect(themeFiles, `${theme} theme component files drift from default`).toEqual(defaultFiles);
    }
  });
});
