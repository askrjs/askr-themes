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
  "item",
  "item-content",
  "item-actions",
  "field-set",
  "field-legend",
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

for (const width of [320, 375, 1440]) {
  test(`fieldset legend keeps its accessible name and content spacing at ${width}px`, async ({
    page,
    render,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await render();
    const fieldset = page.getByRole("group", { name: "Programs", exact: true });
    await expect(fieldset).toHaveAccessibleName("Programs");
    const spacing = await fieldset.evaluate((element) => {
      const legend = element.firstElementChild!;
      const first = legend.nextElementSibling!;
      const second = first.nextElementSibling!;
      return {
        firstSlot: legend.getAttribute("data-slot"),
        legendGap: first.getBoundingClientRect().top - legend.getBoundingClientRect().bottom,
        contentGap: second.getBoundingClientRect().top - first.getBoundingClientRect().bottom,
        expected: Number.parseFloat(getComputedStyle(element).rowGap),
      };
    });
    expect(spacing.firstSlot).toBe("field-legend");
    expect(spacing.legendGap).toBeCloseTo(spacing.expected, 1);
    expect(spacing.contentGap).toBeCloseTo(spacing.expected, 1);
  });

  test(`item actions keep whole labels and wrap when needed at ${width}px`, async ({
    page,
    render,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await render();
    expect(await measure(page, "mid-word-break", '[data-slot="item"]')).toEqual([]);
    expect(await measure(page, "viewport-overflow", '[data-slot="item"]')).toEqual([]);
    const layout = await page.getByTestId("program-item").evaluate((item) => {
      const content = item.querySelector('[data-slot="item-content"]')!.getBoundingClientRect();
      const actions = item.querySelector('[data-slot="item-actions"]')!.getBoundingClientRect();
      return { contentBottom: content.bottom, actionTop: actions.top };
    });
    // At phone widths font metrics can put the actions on either row. The
    // contract is whole labels without overflow; force both layout outcomes
    // below using container widths that are well away from that boundary.
    if (width === 320) expect(layout.actionTop).toBeGreaterThan(layout.contentBottom);
    else if (width === 1440) expect(layout.actionTop).toBeLessThan(layout.contentBottom);
  });
}

test("item actions follow the available container width inside a wide viewport", async ({
  page,
  render,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await render();
  const item = page.getByTestId("program-item");
  for (const [width, wrapped] of [
    [240, true],
    [800, false],
  ] as const) {
    await item.evaluate((element, containerWidth) => {
      (element as HTMLElement).style.inlineSize = `${containerWidth}px`;
    }, width);
    const layout = await item.evaluate((element) => {
      const content = element.querySelector('[data-slot="item-content"]')!.getBoundingClientRect();
      const actions = element.querySelector('[data-slot="item-actions"]')!.getBoundingClientRect();
      return { contentBottom: content.bottom, actionTop: actions.top };
    });
    if (wrapped) expect(layout.actionTop).toBeGreaterThan(layout.contentBottom);
    else expect(layout.actionTop).toBeLessThan(layout.contentBottom);
    expect(await measure(page, "mid-word-break", '[data-testid="program-item"]')).toEqual([]);
    expect(await measure(page, "viewport-overflow", '[data-testid="program-item"]')).toEqual([]);
  }
});
