import { expect, test } from "./fixtures";

test.describe("spinner browser behavior", () => {
  test("should render spinner sizing", async ({ render, root }) => {
    await render();

    const spinner = root.locator('[data-slot="progress-circle"]');

    await expect(spinner).toHaveAttribute("aria-label", "Syncing");
    await expect(spinner).toHaveAttribute("data-state", "indeterminate");
    await expect(spinner).toHaveCSS("inline-size", "36px");
    await expect(spinner).toHaveCSS("block-size", "36px");
  });
});
