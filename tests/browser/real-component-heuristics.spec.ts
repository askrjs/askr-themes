import { expect, test } from "./fixtures";
import { HEURISTICS, WIDTHS, measure } from "./heuristics";

/**
 * The audit heuristics, run against the real components instead of the
 * hand-written audit page. See `scenarios/real-component-heuristics.tsx`.
 */
const EXPECTED_SLOTS = [
  "breadcrumb-link",
  "breadcrumb-page",
  "breadcrumb-separator",
  "navbar",
  "nav-brand",
  "nav-item",
  "button-group",
  "button",
  "checkbox",
  "switch",
  "tab",
  "pill",
] as const;

test.describe("real component heuristics", () => {
  // A heuristic over an empty scope passes vacuously, so prove the scenario rendered every family.
  test("renders every component the heuristics audit", async ({ render, page }) => {
    await render();
    for (const slot of EXPECTED_SLOTS) {
      await expect(
        page.locator(`#mount-root [data-slot="${slot}"]`).first(),
        `missing [data-slot="${slot}"]`,
      ).toBeAttached();
    }
  });

  for (const heuristic of HEURISTICS) {
    for (const width of WIDTHS) {
      test(`${heuristic} at ${width}px`, async ({ page, render }) => {
        await page.setViewportSize({ width, height: 900 });
        await render();
        const violations = await measure(page, heuristic, "#mount-root");
        expect(violations, `${heuristic} at ${width}px`).toEqual([]);
      });
    }
  }
});
