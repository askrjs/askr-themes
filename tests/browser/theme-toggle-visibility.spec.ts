import { expect, test } from "./fixtures";

const TOGGLE = '[data-theme-control="toggle"]';
const VISIBLE_ICON_SLOT = '[data-slot="theme-toggle-icon"]:not([hidden])';

test.describe("theme toggle visibility", () => {
  test("should keep toggle content visible after switching to dark mode", async ({
    render,
    page,
    root,
    run,
  }) => {
    await render();

    const html = page.locator("html");
    const toggles = root.locator(TOGGLE);
    await expect(toggles).toHaveCount(2);

    const iconToggle = toggles.nth(0);
    const textToggle = toggles.nth(1);
    const iconContent = iconToggle.locator('[data-slot="theme-toggle-content"]');
    const iconSlots = iconToggle.locator('[data-slot="theme-toggle-icon"]');
    const visibleIconSlot = iconToggle.locator(VISIBLE_ICON_SLOT);
    const icon = visibleIconSlot.locator("svg");

    await expect(iconToggle).toBeAttached();
    await expect(textToggle).toBeAttached();
    await expect(icon).toBeAttached();
    await expect(iconContent.first()).toBeAttached();
    await expect(iconSlots).toHaveCount(2);
    await expect(iconToggle.locator("svg")).toHaveCount(2);
    await expect(visibleIconSlot).toHaveAttribute("data-theme-toggle-icon", "light");
    await expect(iconToggle.locator('[data-theme-toggle-icon="dark"]')).toHaveAttribute("hidden");
    await expect(icon).toHaveAttribute("data-icon", "sun");
    await expect(icon.locator(":scope > *")).toHaveCount(9);
    await expect(icon).toHaveCSS("inline-size", "14px");
    await expect(icon).toHaveCSS("block-size", "14px");

    await page.evaluate(() =>
      document.documentElement.style.setProperty("--ak-theme-toggle-icon-size", "22px"),
    );

    await expect(icon).toHaveCSS("inline-size", "22px");
    await expect(icon).toHaveCSS("block-size", "22px");
    await expect(textToggle).toHaveText("dark");
    await expect(html).toHaveAttribute("data-theme", "light");

    await iconToggle.evaluate((element) => (element as HTMLButtonElement).click());
    await run("settle");

    await expect(toggles).toHaveCount(2);

    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(iconToggle).toHaveAttribute("data-theme-choice", "dark");
    await expect(iconContent.first()).toBeAttached();
    await expect(iconToggle.locator("svg")).toHaveCount(2);
    await expect(visibleIconSlot).toHaveAttribute("data-theme-toggle-icon", "dark");
    await expect(iconToggle.locator('[data-theme-toggle-icon="light"]')).toHaveAttribute("hidden");
    await expect(icon).toBeAttached();
    await expect(icon).toHaveAttribute("data-icon", "moon");
    await expect(icon.locator(":scope > *")).toHaveCount(1);
    await expect(icon).toHaveCSS("inline-size", "22px");
    await expect(icon).toHaveCSS("block-size", "22px");
    await expect(textToggle).toHaveText("light");
    await expect(textToggle).toHaveAttribute("data-theme-choice", "dark");
    await expect(textToggle).toHaveAttribute("data-next-theme", "light");

    await iconToggle.evaluate((element) => (element as HTMLButtonElement).click());
    await run("settle");

    await expect(toggles).toHaveCount(2);

    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(iconToggle).toHaveAttribute("data-theme-choice", "light");
    await expect(iconContent.first()).toBeAttached();
    await expect(iconToggle.locator("svg")).toHaveCount(2);
    await expect(visibleIconSlot).toHaveAttribute("data-theme-toggle-icon", "light");
    await expect(iconToggle.locator('[data-theme-toggle-icon="dark"]')).toHaveAttribute("hidden");
    await expect(icon).toBeAttached();
    await expect(icon).toHaveAttribute("data-icon", "sun");
    await expect(icon.locator(":scope > *")).toHaveCount(9);
    await expect(icon).toHaveCSS("inline-size", "22px");
    await expect(icon).toHaveCSS("block-size", "22px");
    await expect(textToggle).toHaveText("dark");
    await expect(textToggle).toHaveAttribute("data-theme-choice", "light");
    await expect(textToggle).toHaveAttribute("data-next-theme", "dark");
  });

  test("should size the theme-toggle icon to track --ak-font-size-sm, not --ak-icon-size-sm", async ({
    render,
    page,
    root,
  }) => {
    await render("iconSizing");

    // Probe elements resolve each candidate token to a real computed pixel
    // value, so this assertion tracks the tokens' *actual* defined values
    // rather than pinning a hardcoded px string that would silently drift
    // out of sync with the design tokens file.
    const { expectedIconSizePx, iconSizeSmPx } = await page.evaluate(() => {
      const fontSizeSmProbe = document.createElement("span");
      fontSizeSmProbe.style.fontSize = "var(--ak-font-size-sm)";
      document.body.append(fontSizeSmProbe);
      const fontSize = getComputedStyle(fontSizeSmProbe).fontSize;

      const iconSizeSmProbe = document.createElement("span");
      iconSizeSmProbe.style.inlineSize = "var(--ak-icon-size-sm)";
      document.body.append(iconSizeSmProbe);
      const inlineSize = getComputedStyle(iconSizeSmProbe).inlineSize;

      fontSizeSmProbe.remove();
      iconSizeSmProbe.remove();
      return { expectedIconSizePx: fontSize, iconSizeSmPx: inlineSize };
    });

    const icon = root.locator(`${TOGGLE} ${VISIBLE_ICON_SLOT} svg`);
    await expect(icon).toBeAttached();

    // Sanity: the two tokens actually differ in this theme, otherwise this
    // test could pass by accident regardless of which token is wired up.
    expect(expectedIconSizePx).not.toBe(iconSizeSmPx);

    await expect(icon).toHaveCSS("inline-size", expectedIconSizePx);
    await expect(icon).toHaveCSS("block-size", expectedIconSizePx);
    await expect(icon).not.toHaveCSS("inline-size", iconSizeSmPx);
  });
});
