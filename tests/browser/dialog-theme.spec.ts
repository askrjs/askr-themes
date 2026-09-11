import { type Locator, type Page, expect, test } from "./fixtures";

const VIEWPORT = { width: 390, height: 844 };
const PADDING = 20;

async function waitForAnimationsToFinish(content: Locator): Promise<void> {
  await content.evaluate(async (element) => {
    await Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
  });
}

/**
 * The themed surface must stay inside `PADDING` of every viewport edge, which
 * is what the original `assertWithinViewportPadding` helper measured against a
 * faked `window.innerWidth`/`innerHeight`.
 */
async function assertWithinViewportPadding(content: Locator, padding: number): Promise<void> {
  const rect = await content.boundingBox();
  expect(rect).not.toBeNull();

  expect(rect!.x).toBeGreaterThanOrEqual(padding);
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(VIEWPORT.width - padding);
  expect(rect!.width).toBeLessThanOrEqual(VIEWPORT.width - padding * 2);
  expect(rect!.y).toBeGreaterThanOrEqual(padding);
  expect(rect!.y + rect!.height).toBeLessThanOrEqual(VIEWPORT.height - padding);
}

async function openAndMeasure(page: Page, root: Locator): Promise<void> {
  await root.locator('[aria-haspopup="dialog"]').click();

  const content = page.locator('[data-slot="dialog-content"]');
  await expect(content).toBeVisible();
  await waitForAnimationsToFinish(content);
  await assertWithinViewportPadding(content, PADDING);
}

test.describe("dialog theme overflow regression", () => {
  test.use({ viewport: VIEWPORT });

  test("should keep themed Dialog content inside viewport padding at 390 x 844", async ({
    render,
    page,
    root,
  }) => {
    await render();
    await openAndMeasure(page, root);
  });

  test("should keep themed AlertDialog content inside viewport padding at 390 x 844", async ({
    render,
    page,
    root,
  }) => {
    await render("alertDialog");
    await openAndMeasure(page, root);
  });
});
