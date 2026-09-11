import { expect, test } from "./fixtures";

test.describe("sidebar browser smoke", () => {
  for (const direction of ["ltr", "rtl"] as const) {
    test(`should narrow an icon sidebar and dock its right side after the inset in ${direction}`, async ({
      render,
      page,
      root,
    }) => {
      await render("iconSidebar", { direction });

      const geometry = await page.evaluate(() => {
        const rect = (slot: string) => {
          const { left, right, width } = document
            .querySelector(`#mount-root [data-slot="${slot}"]`)!
            .getBoundingClientRect();
          return { left, right, width };
        };
        const sidebar = document.querySelector('#mount-root [data-slot="sidebar"]')!;
        const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
        return {
          slot: "sidebar / sidebar-rail / sidebar-inset",
          railWidth:
            Number.parseFloat(
              getComputedStyle(sidebar).getPropertyValue("--ak-layout-sidebar-rail-width"),
            ) * rootFontSize,
          sidebar: rect("sidebar"),
          rail: rect("sidebar-rail"),
          inset: rect("sidebar-inset"),
          scope: rect("sidebar-scope"),
        };
      });

      expect(geometry.sidebar.width).toBeCloseTo(geometry.railWidth, 0);
      expect(geometry.sidebar.left).toBeGreaterThanOrEqual(geometry.inset.right - 1);
      expect(geometry.rail.left).toBeGreaterThanOrEqual(geometry.inset.right - 1);
      expect(geometry.rail.right).toBeCloseTo(geometry.sidebar.left, 0);
      expect(geometry.sidebar.right).toBeCloseTo(geometry.scope.right, 0);
      await expect(root.locator('[data-slot="sidebar-menu-button"] span').first()).toHaveCSS(
        "display",
        "none",
      );
    });

    test(`should keep a left sidebar rail between the sidebar and inset in ${direction}`, async ({
      render,
      page,
    }) => {
      await render("leftRail", { direction });

      const geometry = await page.evaluate(() => {
        const rect = (slot: string) => {
          const { left, right } = document
            .querySelector(`#mount-root [data-slot="${slot}"]`)!
            .getBoundingClientRect();
          return { left, right };
        };
        return {
          slot: "sidebar / sidebar-rail / sidebar-inset",
          sidebar: rect("sidebar"),
          rail: rect("sidebar-rail"),
          inset: rect("sidebar-inset"),
        };
      });

      expect(geometry.sidebar.right).toBeCloseTo(geometry.rail.left, 0);
      expect(geometry.rail.right).toBeCloseTo(geometry.inset.left, 0);
    });
  }

  test("should render sidebar as a semantic Block preset beside main content", async ({
    render,
    page,
    root,
  }) => {
    await render("semanticBlock");

    const sidebar = root.locator('[data-slot="sidebar"]').first();
    const main = root.locator('[data-slot="main"]').first();
    const activeItem = root.locator('[data-active="true"]').first();
    const link = root.locator('a[href="/docs/components"]').first();

    expect(await sidebar.evaluate((element) => element.tagName)).toBe("ASIDE");
    await expect(sidebar).toHaveAttribute("aria-label", "Workspace navigation");
    expect(await main.evaluate((element) => element.tagName)).toBe("MAIN");
    await expect(root.locator('[data-slot="nav-group"]')).toHaveCount(2);
    await expect(activeItem).toHaveText("Overview");
    expect(
      await sidebar.evaluate((element) => Number.parseFloat(getComputedStyle(element).width)),
    ).toBeGreaterThan(0);
    await expect(sidebar).not.toHaveCSS("border-right-width", "0px");
    await expect(main).toHaveCSS("flex-grow", "1");

    await link.click();

    await expect.poll(() => new URL(page.url()).pathname).toBe("/docs/components");
    await expect(root.locator("#page")).toHaveText("Components");
  });
});
