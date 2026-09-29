import { describe, expect, it } from "vite-plus/test";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import {
  DEFAULT_THEME_STYLES_DIR,
  DEFAULT_THEME_TOKENS_FILE,
  TEMPLATE_THEME_STYLES_DIR,
} from "./test-paths";

/**
 * Focus-ring treatment contract.
 *
 * The ring is drawn once, in `base/reset.css`, as an `outline` separated from
 * the control by `--ak-focus-ring-offset`. The gap means the colours next to
 * the ring are the surface the control sits on, never the control's own fill,
 * so a bright primary (checked checkbox, switch, primary button) cannot swallow
 * the ring. Components only adjust the offset (inset rows inside clipping
 * containers) or opt out where another element carries the ring.
 */

const SHARED_RULE_FILE = join(DEFAULT_THEME_STYLES_DIR, "base", "reset.css");

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

const STYLE_FILES = [...cssFiles(DEFAULT_THEME_STYLES_DIR), ...cssFiles(TEMPLATE_THEME_STYLES_DIR)];

interface Rule {
  file: string;
  selector: string;
  body: string;
}

function rules(file: string): Rule[] {
  const css = readFileSync(file, "utf-8").replace(/\/\*[\s\S]*?\*\//g, "");
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    file: relative(join(DEFAULT_THEME_STYLES_DIR, "..", "..", "..", ".."), file),
    selector: selector!.replace(/\s+/g, " ").trim(),
    body: body!,
  }));
}

const ALL_RULES = STYLE_FILES.flatMap(rules);

function tokenValue(name: string): string {
  const tokens = readFileSync(DEFAULT_THEME_TOKENS_FILE, "utf-8");
  const match = tokens.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  if (!match) throw new Error(`Missing token ${name}`);
  return match[1]!.trim();
}

function px(value: string): number {
  const match = value.match(/^(\d+(?:\.\d+)?)px$/);
  if (!match) throw new Error(`Expected a px length, received ${value}`);
  return Number(match[1]);
}

/** Rows that sit flush inside scrolling or clipped containers draw the ring inside themselves. */
const INSET_RING_SLOTS = [
  "dropdown-item",
  "menubar-item",
  "menubar-sub-trigger",
  "select-item",
  "menu-item",
  "command-item",
  "navbar-toggle",
  "sidebar-menu-button",
  "nav-item",
];

/** Focus targets whose ring is drawn by a wrapper element instead of themselves. */
const RING_DELEGATED_SLOTS = ["virtual-table-table"];

describe("focus-ring treatment", () => {
  it("should separate the ring from the control with a real gap", () => {
    expect(px(tokenValue("--ak-focus-ring-offset"))).toBeGreaterThanOrEqual(1);
    expect(px(tokenValue("--ak-focus-ring-width"))).toBeGreaterThanOrEqual(2);
  });

  it("should draw the ring once, as an offset outline, in the shared reset", () => {
    const shared = rules(SHARED_RULE_FILE).find(
      ({ selector }) => selector === ":where(:focus-visible)",
    );
    expect(shared, "reset.css needs a :where(:focus-visible) rule").toBeDefined();
    expect(shared!.body).toContain(
      "outline: var(--ak-focus-ring-width) solid var(--ak-color-focus-ring);",
    );
    expect(shared!.body).toContain("outline-offset: var(--ak-focus-ring-offset);");
  });

  it("should never draw a zero-offset box-shadow ring that touches the control", () => {
    const touching = ALL_RULES.filter(({ body }) =>
      /box-shadow:[^;]*var\(--ak-color-focus-ring\)/.test(body),
    ).map(({ file, selector }) => `${file}: ${selector}`);
    expect(touching, "draw focus with the shared outline + offset instead").toEqual([]);
  });

  it("should only use the ring colour through the outline tokens", () => {
    const stray = ALL_RULES.flatMap(({ file, selector, body }) =>
      [...body.matchAll(/([a-z-]+)\s*:\s*([^;]*var\(--ak-color-focus-ring\)[^;]*);/g)]
        .filter(
          ([, property, value]) =>
            !(
              (property === "outline" &&
                value!.trim() === "var(--ak-focus-ring-width) solid var(--ak-color-focus-ring)") ||
              property === "outline-color"
            ),
        )
        .map(([declaration]) => `${file}: ${selector} { ${declaration} }`),
    );
    expect(stray).toEqual([]);
  });

  it("should only remove the focus outline where a wrapper draws the ring", () => {
    const removed = ALL_RULES.filter(
      ({ selector, body }) =>
        /:focus/.test(selector) && /(^|[;\s])outline\s*:\s*(none|0)\s*;/.test(body),
    )
      .filter(({ selector }) => !RING_DELEGATED_SLOTS.some((slot) => selector.includes(slot)))
      .map(({ file, selector }) => `${file}: ${selector}`);
    expect(removed, "focused controls must keep the shared ring").toEqual([]);
  });

  it("should reserve inset rings for rows inside clipping containers", () => {
    const inset = ALL_RULES.filter(({ body }) => /outline-offset\s*:\s*calc\(\s*-/.test(body))
      .filter(({ selector }) => !/forced-colors/.test(selector))
      .filter(
        ({ selector }) =>
          !INSET_RING_SLOTS.some((slot) => new RegExp(`data-slot="${slot}"`).test(selector)),
      )
      .map(({ file, selector }) => `${file}: ${selector}`);
    expect(inset).toEqual([]);
  });

  it("should lift focused members of attached groups above their neighbours", () => {
    const lifted = (file: string, group: string) =>
      rules(join(DEFAULT_THEME_STYLES_DIR, ...file.split("/"))).some(
        ({ selector, body }) =>
          selector.includes(group) &&
          selector.includes('[data-attached="true"]') &&
          selector.includes(":focus-visible") &&
          /z-index\s*:\s*1/.test(body),
      );
    expect(lifted("actions/button-group.css", '[data-slot="button-group"]')).toBe(true);
    expect(lifted("forms/input-group.css", '[data-slot="input-group"]')).toBe(true);
  });
});
