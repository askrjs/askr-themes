import { expect, test } from "./fixtures";

test.describe("themed Toast and default Portal", () => {
  test("should mount a closed Toast beside portaled content without an update loop", async ({
    render,
    page,
  }) => {
    await render();

    // Stands in for the original 20ms scheduler wait: the assertions below must
    // hold once the update scheduler has drained, not merely on first paint.
    await page.waitForTimeout(20);

    await expect(page.locator("body")).toContainText("Sidebar content");
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
  });
});
