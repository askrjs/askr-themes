import { expect, test } from "./fixtures";

/** The viewport the original suite pinned in `beforeEach`. */
const DESKTOP = { width: 1200, height: 900 };

test.describe("navbar browser behavior", () => {
  test("should preserve explicit false ARIA state through theme controls", async ({
    render,
    page,
    root,
  }) => {
    await page.setViewportSize(DESKTOP);
    await render("explicitFalseAria");

    const controls = root.locator("[aria-expanded]");
    await expect(controls).toHaveCount(1);
    await expect(controls.first()).toHaveAttribute("aria-expanded", "false");
  });

  test("should render semantic navbar structure with Block layout styles", async ({
    render,
    page,
    root,
  }) => {
    await page.setViewportSize(DESKTOP);
    await render("semanticStructure");

    const header = root.locator('[data-slot="header"]').first();
    const navbar = root.locator('[data-slot="navbar"]').first();
    const group = root.locator('[data-slot="nav-group"]').first();
    const label = root.locator('[data-slot="nav-group-label"]').first();
    const activeItem = root.locator('[data-active="true"]').first();
    const link = root.locator('a[href="/docs/components"]').first();

    await expect(header).toBeAttached();
    await expect(navbar).toHaveAttribute("aria-label", "Docs navigation");
    await expect(group).toBeAttached();
    await expect(label).toHaveText("Docs");
    await expect(activeItem).toHaveText("Overview");
    await expect(navbar).toHaveCSS("display", "grid");
    await expect(group).toHaveCSS("justify-self", "center");
    expect(
      await navbar.evaluate((element) => Number.parseFloat(getComputedStyle(element).columnGap)),
    ).toBeGreaterThan(0);
    await expect(group).toHaveCSS("flex-direction", "column");
    await expect(group.locator('[data-slot="nav-group-body"]').first()).toHaveCSS(
      "flex-direction",
      "row",
    );
    expect(
      await activeItem.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).paddingInlineStart),
      ),
    ).toBeGreaterThan(0);

    await link.click();

    await expect.poll(() => new URL(page.url()).pathname).toBe("/docs/components");
    await expect(root.locator("#page")).toHaveText("Components");
  });

  test("should center primary routes between brand and end actions", async ({
    render,
    page,
    root,
  }) => {
    await page.setViewportSize(DESKTOP);
    await render("centeredRoutes");

    const endGroup = root
      .locator('[data-slot="navbar"] > [data-slot="nav-group"][data-align="end"]')
      .first();
    const activeItem = root.locator('[data-slot="nav-item"][aria-current="page"]').first();

    const centering = await page.evaluate(() => {
      const scope = document.querySelector("#mount-root")!;
      const navbar = scope.querySelector('[data-slot="navbar"]')!;
      const primaryGroup = scope.querySelector(
        '[data-slot="navbar"] > [data-slot="nav-group"]:not([data-align="end"])',
      )!;
      const navbarRect = navbar.getBoundingClientRect();
      const primaryRect = primaryGroup.getBoundingClientRect();
      return {
        slot: "primary nav-group centre vs navbar centre",
        offset: Math.abs(
          primaryRect.left + primaryRect.width / 2 - (navbarRect.left + navbarRect.width / 2),
        ),
      };
    });

    expect(centering.offset).toBeLessThanOrEqual(1);
    await expect(endGroup).toHaveCSS("justify-self", "end");
    await expect(activeItem).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(activeItem).toHaveCSS("box-shadow", "none");
    await expect(activeItem).toHaveCSS("justify-content", "center");
    await expect(activeItem).toHaveCSS("text-align", "center");
    await expect(activeItem).toHaveCSS("overflow-wrap", "anywhere");
  });

  test("should align collapsed-navbar desktop groups to the navbar grid", async ({
    render,
    page,
    root,
  }) => {
    await page.setViewportSize(DESKTOP);
    await render("collapsedDesktopGroups");

    const navbar = root.locator('[data-slot="navbar"]').first();
    const content = root.locator('[data-slot="navbar-content"]').first();

    await expect(content).toHaveCSS("display", "flex");

    const geometry = await page.evaluate(() => {
      const scope = document.querySelector("#mount-root")!;
      const navbarRect = scope.querySelector('[data-slot="navbar"]')!.getBoundingClientRect();
      const contentScope = scope.querySelector('[data-slot="navbar-content"]')!;
      const primaryRect = contentScope
        .querySelector('[data-slot="nav-group"]:not([data-align="end"])')!
        .getBoundingClientRect();
      const trailingRect = contentScope
        .querySelector('[data-slot="nav-group"][data-align="end"]')!
        .getBoundingClientRect();
      return {
        slot: "navbar-content nav-groups",
        primaryLeft: primaryRect.left,
        navbarLeft: navbarRect.left,
        trailingRightOffset: Math.abs(trailingRect.right - navbarRect.right),
      };
    });

    expect(geometry.primaryLeft).toBeGreaterThanOrEqual(geometry.navbarLeft);
    expect(geometry.trailingRightOffset).toBeLessThanOrEqual(1);

    await navbar.evaluate((element: HTMLElement) => {
      element.dir = "rtl";
    });

    const rtlGeometry = await page.evaluate(() => {
      const scope = document.querySelector("#mount-root")!;
      const navbarRect = scope.querySelector('[data-slot="navbar"]')!.getBoundingClientRect();
      const trailingRect = scope
        .querySelector('[data-slot="navbar-content"] [data-slot="nav-group"][data-align="end"]')!
        .getBoundingClientRect();
      return {
        slot: "rtl trailing nav-group",
        trailingLeftOffset: Math.abs(trailingRect.left - navbarRect.left),
      };
    });

    expect(rtlGeometry.trailingLeftOffset).toBeLessThanOrEqual(1);
  });

  test("should prevent brand content from overlapping centered routes", async ({
    render,
    page,
    root,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await render("brandOverlap");

    const brand = root.locator('[data-slot="nav-brand"]').first();

    const geometry = await page.evaluate(() => {
      const scope = document.querySelector("#mount-root")!;
      const brandRect = scope.querySelector('[data-slot="nav-brand"]')!.getBoundingClientRect();
      const primaryRect = scope
        .querySelector('[data-slot="navbar"] > [data-slot="nav-group"]:not([data-align="end"])')!
        .getBoundingClientRect();
      return {
        slot: "nav-brand vs primary nav-group",
        brandRight: brandRect.right,
        primaryLeft: primaryRect.left,
      };
    });

    expect(geometry.brandRight).toBeLessThanOrEqual(geometry.primaryLeft);
    await expect(brand).toHaveCSS("overflow", "hidden");
  });

  test("should switch responsive navbar between collapsed and inline content", async ({
    render,
    page,
    root,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await render("responsiveNavbar");

    const navbar = root.locator('[data-slot="navbar"]').first();
    const brand = root.locator('[data-slot="nav-brand"]').first();
    const collapse = root.locator('[data-slot="navbar-collapse"]').first();
    const content = root.locator('[data-slot="navbar-content"]').first();
    const toggle = root.locator('[data-slot="navbar-toggle"]').first();

    await expect(navbar).toHaveAttribute("data-collapse-at", "md");
    await expect(brand).toHaveText("Askr");
    await expect(collapse).toBeAttached();
    await expect(content.locator('[data-slot="nav-brand"]')).toHaveCount(0);
    await expect(brand).not.toHaveCSS("display", "none");
    await expect(content).toHaveCSS("display", "none");
    await expect(toggle).not.toHaveCSS("display", "none");

    await toggle.click();

    const menuLink = content.locator('a[href="/docs/components"]').first();

    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(content).toHaveAttribute("data-state", "open");
    await expect(content).toHaveCSS("display", "flex");
    await expect(content).toContainText("Components");

    await menuLink.click();

    await expect.poll(() => new URL(page.url()).pathname).toBe("/docs/components");
    await expect(root.locator('[data-slot="navbar-toggle"]').first()).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(root.locator('[data-slot="navbar"]').first()).toHaveAttribute(
      "data-collapse-at",
      "md",
    );
  });

  test("should open NavDropdown with route-aware NavLink children", async ({
    render,
    page,
    root,
  }) => {
    await page.setViewportSize(DESKTOP);
    await render("navDropdown");

    await root.locator('[data-slot="nav-dropdown-trigger"]').first().click();

    // Dropdown content is portaled outside `#mount-root`.
    const dropdown = page.locator('[data-slot="nav-dropdown-content"]').first();
    const link = dropdown.locator('a[href="/docs/components"]').first();

    await expect(dropdown).toContainText("Components");
    await expect(link).toHaveAttribute("role", "menuitem");
  });
});
