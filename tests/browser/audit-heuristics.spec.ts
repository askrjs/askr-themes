import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { HEURISTICS, WIDTHS, measure, type Width } from "./heuristics";

/**
 * Measured quality heuristics over the whole `visual-check.html` audit surface.
 *
 * `visual-polish.spec.ts` proves the audit renders every family without
 * collapsed or overflowing geometry. This spec asserts defects that geometry
 * checks cannot see: labels broken inside a word, controls too small to hit,
 * wrapped chrome that strands a separator, a truncated current page, and
 * content that pokes out of the viewport outside a declared scroll container.
 * Each heuristic runs at every width so a regression names the viewport and the
 * offending element.
 *
 * The audit page is hand-written markup. `real-component-heuristics.spec.ts`
 * runs the same heuristics against the components themselves, so a green audit
 * cannot hide a gap between the sample and what consumers render.
 */

async function openAudit(page: Page, width: Width): Promise<void> {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/visual-check.html");
  await page.locator(".component-card").first().waitFor();
}

test.describe("audit heuristics", () => {
  for (const heuristic of HEURISTICS) {
    for (const width of WIDTHS) {
      test(`${heuristic} at ${width}px`, async ({ page }) => {
        await openAudit(page, width);
        const violations = await measure(page, heuristic, ".preview");
        expect(violations, `${heuristic} at ${width}px`).toEqual([]);
      });
    }
  }
});
