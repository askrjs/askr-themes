import { describe, expect, it } from "vite-plus/test";
import { readFileSync, readdirSync, type Dirent } from "node:fs";
import { join, relative } from "node:path";

import { DEFAULT_THEME_STYLES_DIR } from "./test-paths";

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry: Dirent) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(path);
    return entry.name.endsWith(".css") ? [path] : [];
  });
}

const styles = cssFiles(DEFAULT_THEME_STYLES_DIR).map((file) => ({
  file: relative(DEFAULT_THEME_STYLES_DIR, file),
  css: readFileSync(file, "utf-8").replace(/\/\*[\s\S]*?\*\//g, ""),
}));

describe("palette vocabulary", () => {
  it("should use --ak-color-hover rather than its --ak-color-accent alias in theme styles", () => {
    const offenders = styles
      .filter(({ css }) => /var\(--ak-color-accent(-ink)?\)/.test(css))
      .map(({ file }) => file);

    expect(offenders, "replace --ak-color-accent with --ak-color-hover").toEqual([]);
  });

  it("should not mix palette colors toward fixed black or white", () => {
    // Fixed endpoints darken or lighten the wrong way in one of the two modes.
    const offenders = styles
      .filter(({ css }) => /color-mix\([^;]*\b(black|white)\b/.test(css))
      .map(({ file }) => file);

    expect(offenders, "mix toward a theme token such as --ak-color-text").toEqual([]);
  });
});
