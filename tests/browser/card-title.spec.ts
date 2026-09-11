import { expect, test } from "./fixtures";

test.describe("card title semantics", () => {
  test("should preserve title styling and slots across heading levels", async ({
    render,
    root,
  }) => {
    await render();

    const titles = root.locator('[data-slot="card-title"]');
    await expect(titles).toHaveCount(3);
    expect(
      await titles.evaluateAll((elements) => elements.map((element) => element.tagName)),
    ).toEqual(["H3", "H1", "H6"]);
    await expect(titles.nth(1)).toHaveClass(/\bcard-title\b/u);
    await expect(titles.nth(1)).toHaveClass(/\bpage-title\b/u);
  });
});
