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
        const reference = document.createElement("div");
        reference.dataset.theme = "ginger";
        document.body.append(reference);
        const expected = token(reference);
        reference.remove();

        return {
          expected,
          children: selectors.map((selector) => {
            const element = document.querySelector(selector) as HTMLElement | null;
            if (!element) return { selector, found: false, light: "", ginger: "" };
            element.dataset.theme = "light";
            const light = token(element);
            element.dataset.theme = "ginger";
            return { selector, found: true, light, ginger: token(element) };
          }),
        };
      },
      Object.values(THEME_FAMILY_AUDIT_SELECTORS) as string[],
    );

    expect(measured.expected).not.toBe("");
    for (const component of measured.children) {
      expect(component.found, `missing real component for ${component.selector}`).toBe(true);
      expect(component.light, `${component.selector} has no light theme token`).not.toBe("");
      expect(component.ginger, `${component.selector} did not adopt the ginger token`).toBe(
        measured.expected,
      );
      expect(component.light, `${component.selector} did not change themes`).not.toBe(
        component.ginger,
      );
    }
  });
});
