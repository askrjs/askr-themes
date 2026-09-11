import { expect, test } from "./fixtures";

test.describe("navbar link browser smoke", () => {
  test("should update active NavLink state across client-side navigation inside a persistent layout", async ({
    render,
    page,
    root,
  }) => {
    await render();

    const overviewLink = root.locator('a[href="/docs"]');
    const aboutLink = root.locator('a[href="/docs/about"]');

    await expect(overviewLink).toHaveAttribute("aria-current", "page");
    await expect(aboutLink).not.toHaveAttribute("aria-current");
    expect(await aboutLink.evaluate((element) => element.tagName)).toBe("A");
    await expect(aboutLink).toHaveAttribute("data-slot", "nav-item");
    await expect(aboutLink).toHaveAttribute("data-ak-layout", "true");
    await expect(aboutLink).toHaveAttribute("href", "/docs/about");

    await aboutLink.click();

    await expect(root.locator("#page")).toHaveText("Docs about");
    expect(new URL(page.url()).pathname).toBe("/docs/about");
    await expect(overviewLink).not.toHaveAttribute("aria-current");
    await expect(aboutLink).toHaveAttribute("aria-current", "page");
  });
});
