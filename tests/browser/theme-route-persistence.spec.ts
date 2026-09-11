import { type Page, expect, test } from "./fixtures";

const TOGGLE = '[data-theme-control="toggle"]';

function storedTheme(page: Page): Promise<string | null> {
  return page.evaluate(() => window.localStorage.getItem("askr-theme"));
}

test.describe("theme route persistence in the browser", () => {
  test("should preserve theme state across navigation and repeated toggles", async ({
    render,
    page,
    root,
    run,
  }) => {
    await render();

    const html = page.locator("html");
    const scope = root.locator('[data-slot="theme-scope"]');
    const toggle = root.locator(TOGGLE);

    await expect(scope).toBeAttached();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(html).toHaveAttribute("data-theme-choice", "light");

    await run("settle");

    await expect(scope).toBeAttached();
    await expect(toggle).toHaveAttribute("data-theme-choice", "light");
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(html).toHaveAttribute("data-theme-choice", "light");

    await toggle.evaluate((element) => (element as HTMLButtonElement).click());
    await run("settle");

    await expect(toggle).toHaveAttribute("data-theme-choice", "dark");
    await expect(toggle).toHaveAttribute("data-next-theme", "light");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(html).toHaveAttribute("data-theme-choice", "dark");
    expect(await storedTheme(page)).toBe("dark");

    await run("navigate", "/about");

    await expect(root.locator("#page")).toHaveText("About");
    await expect(toggle).toHaveAttribute("data-theme-choice", "dark");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(html).toHaveAttribute("data-theme-choice", "dark");
    expect(await storedTheme(page)).toBe("dark");

    await toggle.evaluate((element) => (element as HTMLButtonElement).click());
    await run("settle");

    await expect(toggle).toHaveAttribute("data-theme-choice", "light");
    await expect(toggle).toHaveAttribute("data-next-theme", "dark");
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(html).toHaveAttribute("data-theme-choice", "light");
    expect(await storedTheme(page)).toBe("light");
  });

  test("should preserve cat preset theme state across navigation and repeated toggles", async ({
    render,
    page,
    root,
    run,
  }) => {
    await render("catPresets");

    const html = page.locator("html");
    const toggle = root.locator(TOGGLE);

    await expect(html).toHaveAttribute("data-theme", "tabby");
    await expect(html).toHaveAttribute("data-theme-choice", "tabby");

    await run("settle");

    await expect(toggle).toHaveAttribute("data-theme-choice", "tabby");
    await expect(toggle).toHaveAttribute("data-next-theme", "ginger");
    await expect(toggle).toHaveText("ginger");
    await expect(html).toHaveAttribute("data-theme", "tabby");
    await expect(html).toHaveAttribute("data-theme-choice", "tabby");

    await toggle.evaluate((element) => (element as HTMLButtonElement).click());
    await run("settle");

    await expect(toggle).toHaveAttribute("data-theme-choice", "ginger");
    await expect(toggle).toHaveAttribute("data-next-theme", "tuxedo");
    await expect(toggle).toHaveText("tuxedo");
    await expect(html).toHaveAttribute("data-theme", "ginger");
    await expect(html).toHaveAttribute("data-theme-choice", "ginger");
    expect(await storedTheme(page)).toBe("ginger");

    await run("navigate", "/about");

    await expect(root.locator("#page")).toHaveText("About");
    await expect(toggle).toHaveAttribute("data-theme-choice", "ginger");
    await expect(toggle).toHaveAttribute("data-next-theme", "tuxedo");
    await expect(toggle).toHaveText("tuxedo");
    await expect(html).toHaveAttribute("data-theme", "ginger");
    await expect(html).toHaveAttribute("data-theme-choice", "ginger");
    expect(await storedTheme(page)).toBe("ginger");
  });

  test("should keep pending routed content recoverable after repeated theme toggles", async ({
    render,
    page,
    root,
    run,
  }) => {
    await render("pendingRoute");

    const html = page.locator("html");
    const toggle = root.locator(TOGGLE);
    const topologyPage = root.locator('[data-slot="topology-page"]');

    await expect(topologyPage).toHaveText("Loading messaging topology...");
    expect(await run<number>("fetchCount")).toBe(1);
    await expect(html).toHaveAttribute("data-theme", "light");

    await toggle.evaluate((element) => (element as HTMLButtonElement).click());
    await run("settle");
    await toggle.evaluate((element) => (element as HTMLButtonElement).click());
    await run("settle");

    await expect(html).toHaveAttribute("data-theme", "light");
    expect(await run<number>("fetchCount")).toBe(1);

    await run("resolveTopology");

    await expect(topologyPage).toHaveText("Messaging topology");
    await expect(root.locator('[data-slot="theme-scope"]')).toBeAttached();
  });
});
