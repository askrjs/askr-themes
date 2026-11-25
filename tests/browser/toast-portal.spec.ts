import { expect, test } from "./fixtures";

test.describe("themed Toast and default Portal", () => {
  test("should mount a closed Toast beside portaled content without an update loop", async ({
    render,
    page,
  }) => {
    await render();
    const mutations = await page.evaluate(async () => {
      const body = document.body;
      let mutations = 0;
      const observer = new MutationObserver((records) => {
        mutations += records.length;
      });
      observer.observe(body, { childList: true, attributes: true, subtree: true });
      await new Promise((resolve) => setTimeout(resolve, 100));
      observer.disconnect();
      return mutations;
    });

    await expect(page.locator("body")).toContainText("Sidebar content");
    await expect(page.locator('[data-slot="toast"]')).toHaveCount(0);
    expect(mutations).toBe(0);
  });
});
