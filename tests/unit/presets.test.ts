import { describe, expect, it } from "vite-plus/test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PACKAGE_JSON, SRC_DIR } from "./test-paths";

const PRESET_NAMES = ["tabby", "ginger", "tuxedo", "calico", "torty"] as const;
const PRESETS_INDEX_FILE = join(SRC_DIR, "themes", "presets", "index.css");
const PRESET_DIR = join(SRC_DIR, "themes", "presets");

const REQUIRED_PRESET_TOKENS = [
  "--ak-color-primary",
  "--ak-color-primary-hover",
  "--ak-color-primary-active",
  "--ak-color-primary-soft",
  "--ak-color-primary-ink",
  "--ak-color-text",
  "--ak-color-text-muted",
  "--ak-color-text-subtle",
  "--ak-color-text-inverse",
  "--ak-color-bg",
  "--ak-color-surface",
  "--ak-color-surface-muted",
  "--ak-color-surface-raised",
  "--ak-color-surface-overlay",
  "--ak-color-border-subtle",
  "--ak-color-border",
  "--ak-color-border-strong",
  "--ak-color-success",
  "--ak-color-success-soft",
  "--ak-color-success-ink",
  "--ak-color-warning",
  "--ak-color-warning-soft",
  "--ak-color-warning-ink",
  "--ak-color-danger",
  "--ak-color-danger-soft",
  "--ak-color-danger-ink",
  "--ak-color-info",
  "--ak-color-info-soft",
  "--ak-color-info-ink",
  "--ak-color-link",
  "--ak-color-link-hover",
  "--ak-color-focus-ring",
  "--ak-color-disabled-bg",
  "--ak-color-disabled-surface",
  "--ak-color-disabled-border",
  "--ak-color-disabled-text",
  "--ak-color-selected",
  "--ak-color-selected-border",
  "--ak-color-hover",
  "--ak-color-active",
  "--ak-color-backdrop",
] as const;

function extractDefinedTokens(css: string): Set<string> {
  return new Set([...css.matchAll(/(--ak-[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
}

describe("cat theme presets", () => {
  it("publishes the combined cat preset stylesheet", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    expect(pkg.exports?.["./presets"]).toBe("./src/themes/presets/index.css");
    expect(existsSync(PRESETS_INDEX_FILE)).toBe(true);
  });

  it("collects every cat preset in the combined stylesheet", () => {
    const css = readFileSync(PRESETS_INDEX_FILE, "utf-8");

    for (const preset of PRESET_NAMES) {
      expect(css).toContain(`@import "./${preset}.css";`);
    }
  });

  for (const preset of PRESET_NAMES) {
    it(`${preset} defines the required semantic color token surface`, () => {
      const css = readFileSync(join(PRESET_DIR, `${preset}.css`), "utf-8");
      const tokens = extractDefinedTokens(css);
      const missing = REQUIRED_PRESET_TOKENS.filter((token) => !tokens.has(token));

      expect(css).toContain(`[data-theme="${preset}"]`);
      expect(missing, `${preset} missing tokens: ${missing.join(", ")}`).toEqual([]);
    });
  }
});
