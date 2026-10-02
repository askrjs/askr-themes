import { expect, test } from "./fixtures";

for (const width of [375, 320]) {
  test(`attached button group keeps labels whole and scrolls at ${width}px`, async ({
    page,
    markup,
  }) => {
    await page.setViewportSize({ width, height: 700 });
    await markup(`
      <div style="width: ${width - 32}px; margin: 16px">
        <div data-slot="button-group" data-attached="true" data-responsive="false">
          <button data-slot="button">Compact</button>
          <button data-slot="button">Comfortable</button>
          <button data-slot="button">Disabled</button>
          <button data-slot="button">Detailed operational metrics</button>
        </div>
      </div>
    `);
    const measured = await page.locator('[data-slot="button-group"]').evaluate((group) => {
      const buttons = [...group.querySelectorAll<HTMLElement>('[data-slot="button"]')];
      const lineBoxes = buttons.map((button) => {
        const range = document.createRange();
        range.selectNodeContents(button);
        return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
      });
      return {
        lineBoxes,
        overflowX: getComputedStyle(group).overflowX,
        groupWidth: group.getBoundingClientRect().width,
        containerWidth: group.parentElement!.clientWidth,
        scrollable: group.scrollWidth > group.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        shrunk: buttons.map((button) => button.scrollWidth > button.clientWidth),
      };
    });
    expect(measured.lineBoxes).toEqual([1, 1, 1, 1]);
    expect(measured.overflowX).toBe("auto");
    expect(measured.groupWidth).toBeLessThanOrEqual(measured.containerWidth);
    expect(measured.scrollable).toBe(true);
    expect(measured.documentWidth).toBeLessThanOrEqual(width);
    expect(measured.shrunk).toEqual([false, false, false, false]);
  });

  test(`tabs and pills stay on one row and scroll at ${width}px`, async ({ page, markup }) => {
    await page.setViewportSize({ width, height: 700 });
    await markup(`
      <div style="width: ${width - 32}px; margin: 16px">
        <nav class="tabs" data-slot="tabs" aria-label="Sections">
          <a class="tab" data-slot="tab" href="#">Profile</a>
          <a class="tab" data-slot="tab" href="#">Billing</a>
          <a class="tab" data-slot="tab" href="#" aria-current="page">Security policies</a>
          <a class="tab" data-slot="tab" href="#">Notifications</a>
        </nav>
        <nav class="pills" data-slot="pills" aria-label="Reports">
          <a class="pill" data-slot="pill" href="#">Open</a>
          <a class="pill" data-slot="pill" href="#">Queued review</a>
          <a class="pill" data-slot="pill" href="#">Archived</a>
          <a class="pill" data-slot="pill" href="#">Monthly executive summary</a>
        </nav>
      </div>
    `);
    for (const selector of ['[data-slot="tabs"]', '[data-slot="pills"]']) {
      const measured = await page.locator(selector).evaluate((list) => {
        const tops = [...list.children].map((child) =>
          Math.round(child.getBoundingClientRect().top),
        );
        return {
          rows: new Set(tops).size,
          overflowX: getComputedStyle(list).overflowX,
          listWidth: list.getBoundingClientRect().width,
          containerWidth: list.parentElement!.clientWidth,
          scrollable: list.scrollWidth > list.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
        };
      });
      expect(measured.rows, selector).toBe(1);
      expect(measured.overflowX, selector).toBe("auto");
      expect(measured.listWidth, selector).toBeLessThanOrEqual(measured.containerWidth);
      expect(measured.scrollable, selector).toBe(true);
      expect(measured.documentWidth, selector).toBeLessThanOrEqual(width);
    }
  });
}

test("focus rings on scrolling tabs, pills, and tab triggers are not clipped by the scroller", async ({
  page,
  markup,
}) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await markup(`
    <div style="width: 343px; margin: 16px">
      <nav class="tabs" data-slot="tabs" aria-label="Sections">
        <a class="tab" data-slot="tab" href="#">Profile</a>
        <a class="tab" data-slot="tab" href="#">Billing</a>
      </nav>
      <nav class="pills" data-slot="pills" aria-label="Reports">
        <a class="pill" data-slot="pill" href="#">Open</a>
        <a class="pill" data-slot="pill" href="#">Queued review</a>
      </nav>
      <div data-slot="tabs-list" role="tablist">
        <button data-slot="tabs-trigger" role="tab" data-state="active">Overview</button>
        <button data-slot="tabs-trigger" role="tab">Activity</button>
      </div>
    </div>
  `);
  const links = page.locator('[data-slot="tab"], [data-slot="pill"], [data-slot="tabs-trigger"]');
  const count = await links.count();
  for (let index = 0; index < count; index += 1) {
    // A keyboard event first, so a programmatic focus matches :focus-visible in every engine.
    await page.keyboard.press("Shift");
    await links.nth(index).focus();
    const clipped = await page.evaluate(() => {
      const target = document.activeElement as HTMLElement;
      const scroller = target.closest<HTMLElement>(
        '[data-slot="tabs"], [data-slot="pills"], [data-slot="tabs-list"]',
      )!;
      const style = getComputedStyle(target);
      if (style.outlineStyle === "none") throw new Error("focused item has no focus ring");
      const extent = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);
      const box = target.getBoundingClientRect();
      const clip = scroller.getBoundingClientRect();
      const border = (side: string) => Number.parseFloat(getComputedStyle(scroller)[side as never]);
      return {
        label: target.textContent,
        start: box.left - Math.max(extent, 0) - (clip.left + border("borderLeftWidth")),
        top: box.top - Math.max(extent, 0) - (clip.top + border("borderTopWidth")),
        bottom: clip.bottom - border("borderBottomWidth") - (box.bottom + Math.max(extent, 0)),
      };
    });
    expect(clipped.start, `${clipped.label} start`).toBeGreaterThanOrEqual(-0.5);
    expect(clipped.top, `${clipped.label} top`).toBeGreaterThanOrEqual(-0.5);
    expect(clipped.bottom, `${clipped.label} bottom`).toBeGreaterThanOrEqual(-0.5);
  }
});
