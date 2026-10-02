import { expect, test, type Page } from "./fixtures";

/**
 * Published consumer token overrides placed after the theme import.
 *
 * THEMING.md documents `:root { --ak-color-*: ... }` as the token override.
 * A later :root override restyles explicit document modes and presets. System
 * dark keeps its more specific rule; nested scopes define their own values.
 * Each check compares a mode's tokens with the consumer sheet enabled
 * against the same mode with it disabled, so no expectation hardcodes a
 * palette value.
 */

const TOKENS = ["--ak-color-primary", "--ak-color-bg", "--ak-color-text"] as const;
const PRESETS = ["tabby", "ginger", "tuxedo", "calico", "torty"] as const;

const ROOT_OVERRIDE = `:root {
  --ak-color-primary: rgb(1, 2, 3);
  --ak-color-bg: rgb(4, 5, 6);
  --ak-color-text: rgb(7, 8, 9);
}`;
const OVERRIDDEN = {
  "--ak-color-primary": "rgb(1, 2, 3)",
  "--ak-color-bg": "rgb(4, 5, 6)",
  "--ak-color-text": "rgb(7, 8, 9)",
};

interface Setup {
  /** `data-theme` on `<html>`; `null` leaves the attribute off (system mode). */
  html: string | null;
  /** Optional nested element with its own `data-theme`, measured instead of `<html>`. */
  nested?: string;
}

type Sample = Record<string, string>;

/** Reads the probe's tokens with the consumer sheet enabled, then disabled. */
async function sample(page: Page, setup: Setup): Promise<{ on: Sample; off: Sample }> {
  return page.evaluate(
    ({ setup, tokens }) => {
      const html = document.documentElement;
      if (setup.html === null) html.removeAttribute("data-theme");
      else html.setAttribute("data-theme", setup.html);

      document.querySelector("[data-probe='nested']")?.remove();
      let probe: Element = html;
      if (setup.nested) {
        const nested = document.createElement("section");
        nested.dataset.theme = setup.nested;
        nested.dataset.probe = "nested";
        document.getElementById("mount-root")!.append(nested);
        probe = nested;
      }

      const sheet = (document.getElementById("consumer-token-override") as HTMLStyleElement).sheet!;
      const read = (): Record<string, string> => {
        const style = getComputedStyle(probe);
        return Object.fromEntries([
          ...tokens.map((token) => [token, style.getPropertyValue(token).trim()]),
          ["color-scheme", style.colorScheme],
        ]);
      };

      sheet.disabled = false;
      const on = read();
      sheet.disabled = true;
      const off = read();
      sheet.disabled = false;
      return { on, off };
    },
    { setup, tokens: [...TOKENS] },
  );
}

async function expectThemeValues(page: Page, setup: Setup, label: string): Promise<void> {
  const { on, off } = await sample(page, setup);
  expect(off["--ak-color-primary"], `${label}: theme value`).not.toBe("");
  expect(on, `${label}: keeps the theme's own tokens`).toEqual(off);
}

async function expectOverride(page: Page, setup: Setup, label: string): Promise<void> {
  const { on, off } = await sample(page, setup);
  expect(on, `${label}: applies the consumer override`).toEqual({ ...off, ...OVERRIDDEN });
}

test.describe("published attribute token override recipes", () => {
  for (const theme of ["dark", ...PRESETS]) {
    test(`should preserve the published ${theme} override on the document root`, async ({
      render,
      page,
    }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await render("default", {
        css: `[data-theme="${theme}"] {
          --ak-color-bg: #0f172a;
          --ak-color-text: #f1f5f9;
          --ak-color-surface: #111827;
        }`,
      });
      await page.locator("html").evaluate((element, name) => {
        element.setAttribute("data-theme", name);
      }, theme);

      const tokens = await page.locator("html").evaluate((element) => {
        const style = getComputedStyle(element);
        return Object.fromEntries(
          ["--ak-color-bg", "--ak-color-text", "--ak-color-surface"].map((token) => [
            token,
            style.getPropertyValue(token).trim(),
          ]),
        );
      });
      expect(tokens).toEqual({
        "--ak-color-bg": "#0f172a",
        "--ak-color-text": "#f1f5f9",
        "--ak-color-surface": "#111827",
      });
    });
  }
});

test.describe("consumer :root token override", () => {
  test("should preserve published root overrides in explicit modes", async ({ render, page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await render("default", { css: ROOT_OVERRIDE });

    await expectOverride(page, { html: null }, "system light");
    await expectOverride(page, { html: "light" }, "explicit light");
    await expectOverride(page, { html: "dark" }, "explicit dark");
    for (const preset of PRESETS) {
      await expectOverride(page, { html: preset }, `${preset} preset`);
    }
  });

  test("should keep system dark tokens", async ({ render, page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await render("default", { css: ROOT_OVERRIDE });

    await expectThemeValues(page, { html: null }, "system dark");
    await expectOverride(page, { html: "light" }, "explicit light under a dark OS");
  });

  test("should keep nested scope tokens", async ({ render, page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await render("default", { css: ROOT_OVERRIDE });

    await expectThemeValues(page, { html: "light", nested: "dark" }, "dark inside light");
    await expectThemeValues(page, { html: "dark", nested: "light" }, "light inside dark");
    await expectThemeValues(page, { html: "dark", nested: "dark" }, "dark inside dark");
    await expectThemeValues(page, { html: "light", nested: "torty" }, "torty inside light");
  });

  for (const [outer, inner] of [
    ["light", "dark"],
    ["dark", "light"],
    ["light", "torty"],
  ] as const) {
    test(`should resolve nested ThemeScope ${inner} inside ${outer}`, async ({ render, page }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await render("nestedScopes", { css: ROOT_OVERRIDE, outer, inner });

      await expect(page.locator("html")).toHaveAttribute("data-theme", inner);
      const setup = { html: inner };
      const label = `ThemeScope ${inner} inside ${outer}`;
      await expectOverride(page, setup, label);
    });
  }
});

test.describe("documented mode-specific override recipes", () => {
  test("light-only recipe reaches nested light scopes and leaves dark alone", async ({
    render,
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await render("default", {
      css: `[data-theme="light"] {\n  --ak-color-primary: rgb(1, 2, 3);\n}
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) {\n    --ak-color-primary: rgb(1, 2, 3);\n  }
}`,
    });

    for (const setup of [
      { html: null },
      { html: "light" },
      { html: "dark", nested: "light" },
    ] satisfies Setup[]) {
      const { on } = await sample(page, setup);
      expect(on["--ak-color-primary"], JSON.stringify(setup)).toBe("rgb(1, 2, 3)");
    }
    await expectThemeValues(page, { html: "dark" }, "explicit dark");
    await expectThemeValues(page, { html: "light", nested: "dark" }, "dark inside light");
    await expectThemeValues(page, { html: "tabby" }, "tabby preset");

    await page.emulateMedia({ colorScheme: "dark" });
    await expectThemeValues(page, { html: null }, "system dark");
  });

  test("dark-only recipe reaches explicit, system, and nested dark", async ({ render, page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await render("default", { css: `:root {\n  --ak-dark-color-primary: rgb(10, 20, 30);\n}` });

    for (const setup of [{ html: "dark" }, { html: "light", nested: "dark" }] satisfies Setup[]) {
      const { on } = await sample(page, setup);
      expect(on["--ak-color-primary"], JSON.stringify(setup)).toBe("rgb(10, 20, 30)");
    }
    await expectThemeValues(page, { html: null }, "system light");
    await expectThemeValues(page, { html: "light" }, "explicit light");

    await page.emulateMedia({ colorScheme: "dark" });
    const { on } = await sample(page, { html: null });
    expect(on["--ak-color-primary"], "system dark").toBe("rgb(10, 20, 30)");
  });
});
