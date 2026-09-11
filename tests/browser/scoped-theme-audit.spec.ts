import { THEME_FAMILY_AUDIT_SELECTORS } from "../fixtures/component-audit-matrix";

import { expect, test } from "./fixtures";

const THEMES = ["light", "dark", "tabby", "ginger", "tuxedo", "calico", "torty"] as const;

test.describe("scoped theme audit", () => {
  test("should isolate simultaneous sibling and nested theme scopes across every preset", async ({
    render,
    page,
  }) => {
    await render();

    const initial = await page.evaluate(
      (themes) => {
        const TOKEN = "--ak-color-primary";
        const token = (element: Element): string =>
          getComputedStyle(element).getPropertyValue(TOKEN).trim();

        const roots = themes.map((theme) => {
          const root = document.createElement("section");
          root.dataset.theme = theme;
          root.dataset.auditTheme = theme;
          const nested = document.createElement("div");
          nested.dataset.theme = theme === "dark" ? "light" : "dark";
          root.append(nested);
          document.body.append(root);
          return { theme, root, nested };
        });

        (window as unknown as { auditRoots: typeof roots }).auditRoots = roots;
        return roots.map(({ theme, root, nested }) => ({
          theme,
          root: token(root),
          nested: token(nested),
        }));
      },
      THEMES as unknown as string[],
    );

    const original = new Map(initial.map(({ theme, root }) => [theme, root]));
    for (const { theme, root, nested } of initial) {
      expect({ theme, token: root }).not.toEqual({ theme, token: "" });
      expect({ label: `nested override under ${theme}`, token: nested }).toEqual({
        label: `nested override under ${theme}`,
        token: original.get(theme === "dark" ? "light" : "dark"),
      });
    }

    const afterSwap = await page.evaluate(() => {
      const TOKEN = "--ak-color-primary";
      const roots = (
        window as unknown as {
          auditRoots: Array<{ theme: string; root: HTMLElement; nested: HTMLElement }>;
        }
      ).auditRoots;
      roots[0]!.root.dataset.theme = "torty";
      return roots.slice(1).map(({ theme, root }) => ({
        theme,
        token: getComputedStyle(root).getPropertyValue(TOKEN).trim(),
      }));
    });

    for (const { theme, token } of afterSwap) {
      expect({ label: `sibling ${theme} leaked`, token }).toEqual({
        label: `sibling ${theme} leaked`,
        token: original.get(theme),
      });
    }
  });

  test("should propagate a mounted theme change through every public component family", async ({
    render,
    page,
  }) => {
    await render();

    const measured = await page.evaluate(
      (selectors) => {
        const TOKEN = "--ak-color-primary";
        const token = (element: Element): string =>
          getComputedStyle(element).getPropertyValue(TOKEN).trim();

        const root = document.createElement("section");
        root.dataset.theme = "light";
        for (const selector of selectors) {
          const slot = selector.match(/data-slot="([^"]+)"/u)?.[1];
          const element = document.createElement("div");
          element.dataset.slot = slot!;
          root.append(element);
        }
        document.body.append(root);

        root.dataset.theme = "ginger";
        return {
          expected: token(root),
          children: Array.from(root.children, (element) => ({
            slot: (element as HTMLElement).dataset.slot,
            token: token(element),
          })),
        };
      },
      Object.values(THEME_FAMILY_AUDIT_SELECTORS) as string[],
    );

    expect(measured.expected).not.toBe("");
    for (const { slot, token } of measured.children) {
      expect({ slot, token }).toEqual({ slot, token: measured.expected });
    }
  });
});
