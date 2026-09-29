import { expect, test, type Page } from "./fixtures";

/**
 * Consumer token overrides placed after the theme import (issue #155).
 *
 * THEMING.md documents `:root { --ak-color-*: ... }` as the token override.
 * That override must restyle light mode only: explicit `data-theme="dark"`,
 * system dark, the cat presets, and nested theme scopes keep the theme's own
 * values. Each check compares a mode's tokens with the consumer sheet enabled
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
  "color-scheme": "light",
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
  const { on } = await sample(page, setup);
  expect(on, `${label}: applies the consumer override`).toEqual(OVERRIDDEN);
}

test.describe("consumer :root token override", () => {
  test("should restyle light mode only", async ({ render, page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await render("default", { css: ROOT_OVERRIDE });

    await expectOverride(page, { html: null }, "system light");
    await expectOverride(page, { html: "light" }, "explicit light");
    await expectThemeValues(page, { html: "dark" }, "explicit dark");
    for (const preset of PRESETS) {
      await expectThemeValues(page, { html: preset }, `${preset} preset`);
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

  for (const [outer, inner, expected] of [
    ["light", "dark", "theme"],
    ["dark", "light", "override"],
    ["light", "torty", "theme"],
  ] as const) {
    test(`should resolve nested ThemeScope ${inner} inside ${outer}`, async ({ render, page }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await render("nestedScopes", { css: ROOT_OVERRIDE, outer, inner });

      await expect(page.locator("html")).toHaveAttribute("data-theme", inner);
      const setup = { html: inner };
      const label = `ThemeScope ${inner} inside ${outer}`;
      if (expected === "theme") await expectThemeValues(page, setup, label);
      else await expectOverride(page, setup, label);
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
      css: `:root,\n[data-theme="light"] {\n  --ak-color-primary: rgb(1, 2, 3);\n}`,
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
