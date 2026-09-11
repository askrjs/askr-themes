import { expect, test } from "./fixtures";

test.describe("navbar and sidebar overlay recipes", () => {
  test("should compose real Dropdown primitives inside navbar and sidebar recipes", async ({
    render,
    page,
    root,
  }) => {
    await render("first");

    await root.locator('[aria-label="Navbar navigation"] [data-slot="dropdown-trigger"]').click();

    // Dropdown content is portaled outside `#mount-root`.
    const productMenu = page.locator('[data-slot="dropdown-content"][aria-label="Product menu"]');
    const productLink = page.locator('[data-slot="dropdown-item"][href="/docs/components"]');

    await expect(productMenu).toHaveAttribute("data-align", "start");
    await expect(productLink).toHaveAttribute("role", "menuitem");
    await expect(productLink).not.toHaveAttribute("match");

    await productLink.click();

    await expect.poll(() => new URL(page.url()).pathname).toBe("/docs/components");

    await render("second");

    await root.locator('[aria-label="Sidebar navigation"] [data-slot="dropdown-trigger"]').click();

    const sidebarMenu = page.locator(
      '[data-slot="dropdown-content"][aria-label="Sidebar workspace menu"]',
    );
    await expect(sidebarMenu).toHaveAttribute("data-side", "right");
    await expect(sidebarMenu).toHaveAttribute("data-align", "start");
  });
});
