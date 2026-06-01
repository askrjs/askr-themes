import { describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";

import {
  DEFAULT_ICON_CSS,
  DEFAULT_THEME_TOKENS_FILE,
  TEMPLATE_ICON_CSS,
  THEMING_FILE,
} from "./test-paths";

const TOKENS_FILE = DEFAULT_THEME_TOKENS_FILE;

describe("icon theme contract", () => {
  it("should ships the same icon baseline in default and template themes", () => {
    const defaultCss = readFileSync(DEFAULT_ICON_CSS, "utf-8");
    const templateCss = readFileSync(TEMPLATE_ICON_CSS, "utf-8");
    expect(templateCss).toBe(defaultCss);
  });

  it("should documents the icon public hooks", () => {
    const docs = readFileSync(THEMING_FILE, "utf-8");
    expect(docs).toContain("`@askrjs/ui` owns the canonical icon hooks");
    expect(docs).toContain('`data-slot="icon"`');
    expect(docs).toContain("`data-icon`");
    expect(docs).toContain("`data-decorative`");
    expect(docs).toContain("--ak-icon-size-sm");
  });

  it("should defines icon size and stroke tokens", () => {
    const tokens = readFileSync(TOKENS_FILE, "utf-8");
    expect(tokens).toContain("--ak-icon-size-sm");
    expect(tokens).toContain("--ak-icon-size-md");
    expect(tokens).toContain("--ak-icon-size-lg");
    expect(tokens).toContain("--ak-icon-size-xl");
    expect(tokens).toContain("--ak-icon-stroke-width-sm");
    expect(tokens).toContain("--ak-icon-stroke-width-md");
    expect(tokens).toContain("--ak-icon-stroke-width-lg");
    expect(tokens).toContain("--ak-icon-stroke-width-xl");
  });
});
