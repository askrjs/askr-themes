import { describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const COMPONENTS_FILE = join(__dirname, "..", "src", "components", "index.ts");
const THEMES_DOC = join(__dirname, "..", "docs", "askr-themes.md");
const THEMING_DOC = join(__dirname, "..", "docs", "theming.md");

function ordered(source: string, needles: string[]): boolean {
  let cursor = -1;

  for (const needle of needles) {
    const next = source.indexOf(needle, cursor + 1);
    if (next === -1 || next < cursor) {
      return false;
    }
    cursor = next;
  }

  return true;
}

describe("docs surface", () => {
  it("groups the barrel into the documented families", () => {
    const barrel = readFileSync(COMPONENTS_FILE, "utf-8");

    expect(
      ordered(barrel, [
        "// Theme controls",
        "// Visual primitives",
        "// Theme-owned wrappers",
        "// Empty state",
        "// Shell / chrome",
      ]),
    ).toBe(true);
  });

  it("documents the same curated families and canonical names", () => {
    const themesDoc = readFileSync(THEMES_DOC, "utf-8");
    const themingDoc = readFileSync(THEMING_DOC, "utf-8");

    expect(themesDoc).toContain("## What askr-themes is");
    expect(themesDoc).toContain("## When to reach for what");
    expect(themesDoc).toContain("Theme controls");
    expect(themesDoc).toContain("Visual primitives");
    expect(themesDoc).toContain("Theme-owned wrappers");
    expect(themesDoc).toContain("Shell and navigation chrome");
    expect(themesDoc).toContain("AspectRatio");
    expect(themesDoc).toContain("AccessibleIcon");
    expect(themesDoc).toContain("Header");
    expect(themesDoc).toContain("Breadcrumb");
    expect(themesDoc).toContain("Spinner");

    expect(themingDoc).toContain("## Selector Contract");
    expect(themingDoc).toContain("AspectRatio");
    expect(themingDoc).toContain("AccessibleIcon");
    expect(themingDoc).toContain("Header");
    expect(themingDoc).toContain("Breadcrumb");
    expect(themingDoc).toContain("Spinner");
  });
});
