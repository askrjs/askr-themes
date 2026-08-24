import { afterEach, describe, expect, it } from "vite-plus/test";

import { THEME_FAMILY_AUDIT_SELECTORS } from "../fixtures/component-audit-matrix";

import "../../src/themes/default/index.css";
import "../../src/themes/presets/index.css";

const THEMES = ["light", "dark", "tabby", "ginger", "tuxedo", "calico", "torty"] as const;
const TOKEN = "--ak-color-primary";

function token(element: Element): string {
  return getComputedStyle(element).getPropertyValue(TOKEN).trim();
}

describe("scoped theme audit", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("should isolate simultaneous sibling and nested theme scopes across every preset", () => {
    const roots = THEMES.map((theme) => {
      const root = document.createElement("section");
      root.dataset.theme = theme;
      root.dataset.auditTheme = theme;
      const nested = document.createElement("div");
      nested.dataset.theme = theme === "dark" ? "light" : "dark";
      root.append(nested);
      document.body.append(root);
      return { theme, root, nested };
    });

    const original = new Map(roots.map(({ theme, root }) => [theme, token(root)]));
    for (const { theme, root, nested } of roots) {
      expect(token(root), theme).not.toBe("");
      expect(token(nested), `nested override under ${theme}`).toBe(
        original.get(theme === "dark" ? "light" : "dark"),
      );
    }

    roots[0]!.root.dataset.theme = "torty";
    for (const { theme, root } of roots.slice(1)) {
      expect(token(root), `sibling ${theme} leaked`).toBe(original.get(theme));
    }
  });

  it("should propagate a mounted theme change through every public component family", () => {
    const root = document.createElement("section");
    root.dataset.theme = "light";
    for (const selector of Object.values(THEME_FAMILY_AUDIT_SELECTORS)) {
      const slot = selector.match(/data-slot="([^"]+)"/u)?.[1];
      const element = document.createElement("div");
      element.dataset.slot = slot!;
      root.append(element);
    }
    document.body.append(root);

    root.dataset.theme = "ginger";
    const expected = token(root);
    expect(expected).not.toBe("");
    for (const element of root.children) {
      expect(token(element), (element as HTMLElement).dataset.slot).toBe(expected);
    }
  });
});
