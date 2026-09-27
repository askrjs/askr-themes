import { expect, test } from "./fixtures";

for (const mode of ["light", "dark"] as const) {
  test(`should keep ${mode} empty states, controls, and raw cards visually composed`, async ({
    markup,
    root,
  }) => {
    await markup(`
      <div data-theme="${mode}" style="width: 280px; padding: 12px; background: var(--ak-color-bg)">
        <section data-slot="empty-state">
          <div data-slot="empty-state-icon">0</div>
          <h4 data-slot="empty-state-title">No results</h4>
          <p data-slot="empty-state-description">Try a shorter date range for this workspace.</p>
          <div data-slot="empty-state-actions">
            <button data-slot="button">Reset filters</button>
          </div>
        </section>
        <textarea data-slot="textarea">A short note</textarea>
        <textarea data-slot="textarea" disabled>Disabled note</textarea>
        <article data-slot="card"><div>Card content</div></article>
        <div data-slot="button-group" data-attached="true">
          <button data-slot="button">Compact</button>
          <button data-slot="button">Comfortable</button>
          <button data-slot="button">Disabled</button>
        </div>
      </div>
    `);

    const measured = await root.evaluate((container) => {
      const scope = container.querySelector("[data-theme]") as HTMLElement;
      const find = (selector: string): HTMLElement => scope.querySelector(selector) as HTMLElement;
      const bottom = (element: HTMLElement): number => element.getBoundingClientRect().bottom;
      const top = (element: HTMLElement): number => element.getBoundingClientRect().top;
      const empty = find('[data-slot="empty-state"]');
      const icon = find('[data-slot="empty-state-icon"]');
      const title = find('[data-slot="empty-state-title"]');
      const description = find('[data-slot="empty-state-description"]');
      const actions = find('[data-slot="empty-state-actions"]');
      const textarea = find('[data-slot="textarea"]:not(:disabled)');
      const disabledTextarea = find('[data-slot="textarea"]:disabled');
      const card = find('[data-slot="card"]');
      const cardContent = card.firstElementChild as HTMLElement;
      const group = find('[data-slot="button-group"]');
      const buttons = [...group.querySelectorAll<HTMLElement>('[data-slot="button"]')];

      return {
        emptyDisplay: getComputedStyle(empty).display,
        emptyGaps: [top(title) - bottom(icon), top(description) - bottom(title), top(actions) - bottom(description)],
        textareaFont: getComputedStyle(textarea).fontFamily,
        disabledTextareaOpacity: getComputedStyle(disabledTextarea).opacity,
        bodyFont: getComputedStyle(scope).fontFamily,
        cardInset: Number.parseFloat(getComputedStyle(cardContent).paddingInlineStart),
        groupWidth: group.clientWidth,
        groupScrollWidth: group.scrollWidth,
        groupButtonHeights: buttons.map((button) => button.getBoundingClientRect().height),
        groupButtonWhiteSpace: buttons.map((button) => getComputedStyle(button).whiteSpace),
      };
    });

    expect(measured.emptyDisplay).toBe("grid");
    for (const gap of measured.emptyGaps) expect(gap).toBeGreaterThanOrEqual(8);
    expect(measured.textareaFont).toBe(measured.bodyFont);
    expect(measured.disabledTextareaOpacity).toBe("1");
    expect(measured.cardInset).toBeGreaterThanOrEqual(20);
    expect(measured.groupScrollWidth).toBeLessThanOrEqual(measured.groupWidth);
    expect(measured.groupButtonHeights).toEqual([36, 36, 36]);
    expect(measured.groupButtonWhiteSpace).toEqual(["nowrap", "nowrap", "nowrap"]);
  });
}

test("should show every attached action at phone width", async ({ page, markup, root }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await markup(`
    <div style="width: 220px">
      <div data-slot="button-group" data-attached="true">
        <button data-slot="button">Compact</button>
        <button data-slot="button">Comfortable</button>
        <button data-slot="button">Disabled</button>
      </div>
    </div>
  `);

  const measured = await root.evaluate((container) => {
    const group = container.querySelector('[data-slot="button-group"]') as HTMLElement;
    const buttons = [...group.querySelectorAll<HTMLElement>('[data-slot="button"]')];
    return {
      direction: getComputedStyle(group).flexDirection,
      groupWidth: group.getBoundingClientRect().width,
      buttons: buttons.map((button) => ({
        width: button.getBoundingClientRect().width,
        height: button.getBoundingClientRect().height,
      })),
    };
  });

  expect(measured.direction).toBe("column");
  for (const button of measured.buttons) {
    expect(button.width).toBeLessThanOrEqual(measured.groupWidth);
    expect(button.height).toBe(36);
  }
});
