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
        emptyGaps: [
          top(title) - bottom(icon),
          top(description) - bottom(title),
          top(actions) - bottom(description),
        ],
        textareaFont: getComputedStyle(textarea).fontFamily,
        disabledTextareaOpacity: getComputedStyle(disabledTextarea).opacity,
        textareaColor: getComputedStyle(textarea).color,
        disabledTextareaColor: getComputedStyle(disabledTextarea).color,
        bodyFont: getComputedStyle(scope).fontFamily,
        cardInset:
          cardContent.getBoundingClientRect().left -
          card.getBoundingClientRect().left -
          Number.parseFloat(getComputedStyle(card).borderInlineStartWidth),
        groupWidth: group.clientWidth,
        groupScrollWidth: group.scrollWidth,
        groupButtonHeights: buttons.map((button) => button.getBoundingClientRect().height),
        groupOverflow: getComputedStyle(group).overflow,
      };
    });

    expect(measured.emptyDisplay).toBe("grid");
    for (const gap of measured.emptyGaps) expect(gap).toBeGreaterThanOrEqual(8);
    expect(measured.textareaFont).toBe(measured.bodyFont);
    expect(measured.disabledTextareaOpacity).toBe("1");
    expect(measured.disabledTextareaColor).not.toBe(measured.textareaColor);
    expect(measured.cardInset).toBeGreaterThanOrEqual(20);
    expect(measured.groupScrollWidth).toBeLessThanOrEqual(measured.groupWidth);
    expect(measured.groupButtonHeights).toEqual([36, 36, 36]);
    expect(measured.groupOverflow).toBe("visible");
  });
}

test("should show every attached action at phone width", async ({ page, markup, root }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await markup(`
    <div style="width: 220px">
      <div data-slot="button-group" data-attached="true" data-responsive="true">
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

test("should compose default ButtonGroups and direct Card children at phone width", async ({
  page,
  render,
  root,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await render();

  const measured = await root.evaluate((container) => {
    const find = (selector: string): HTMLElement =>
      container.querySelector(selector) as HTMLElement;
    const buttonsOf = (testId: string): HTMLElement[] => [
      ...find(`[data-testid="${testId}"]`).querySelectorAll<HTMLElement>('[data-slot="button"]'),
    ];
    const group = (testId: string) => {
      const element = find(`[data-testid="${testId}"]`);
      const box = element.getBoundingClientRect();
      return {
        direction: getComputedStyle(element).flexDirection,
        width: element.clientWidth,
        scrollWidth: element.scrollWidth,
        buttons: buttonsOf(testId).map((button) => {
          const rect = button.getBoundingClientRect();
          const style = getComputedStyle(button);
          return {
            top: rect.top,
            left: rect.left - box.left,
            right: box.right - rect.right,
            width: rect.width,
            scrollWidth: button.scrollWidth,
            clientWidth: button.clientWidth,
            radii: [
              style.borderTopLeftRadius,
              style.borderTopRightRadius,
              style.borderBottomRightRadius,
              style.borderBottomLeftRadius,
            ],
          };
        }),
      };
    };
    const card = find('[data-slot="card"]');
    const cardBox = card.getBoundingClientRect();
    const inset = (testId: string) => {
      const element = find(`[data-testid="${testId}"]`);
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        start: box.left - cardBox.left + Number.parseFloat(style.paddingInlineStart),
        end: cardBox.right - box.right + Number.parseFloat(style.paddingInlineEnd),
      };
    };

    return {
      orientation: find('[data-testid="default-group"]').dataset.orientation,
      defaultGroup: group("default-group"),
      rowGroup: group("row-group"),
      iconGroup: group("icon-group"),
      longGroup: group("long-group"),
      loneGroup: group("lone-group"),
      insets: Object.fromEntries(
        [
          "raw-card-content",
          "role-card-content",
          "form-card-content",
          "block-card-content",
          "text-card-content",
          "title-card-content",
          "direct-card-input",
          "card-button",
        ].map((testId) => [testId, inset(testId)]),
      ),
      cardButtonPadding: getComputedStyle(find('[data-testid="card-button"]')).paddingInlineStart,
      referenceButtonPadding: getComputedStyle(find('[data-testid="reference-button"]'))
        .paddingInlineStart,
      inputFitsCard:
        find('[data-testid="direct-card-input"]').getBoundingClientRect().right <= cardBox.right,
    };
  });

  expect(measured.orientation).toBe("horizontal");
  expect(measured.defaultGroup.direction).toBe("column");
  expect(measured.defaultGroup.scrollWidth).toBeLessThanOrEqual(measured.defaultGroup.width);
  const tops = measured.defaultGroup.buttons.map((button) => button.top);
  expect(tops[0]).toBeLessThan(tops[1]!);
  expect(tops[1]).toBeLessThan(tops[2]!);

  expect(measured.rowGroup.direction).toBe("row");
  expect(measured.iconGroup.direction).toBe("row");
  for (const button of measured.iconGroup.buttons) expect(button.width).toBe(36);

  expect(measured.longGroup.direction).toBe("column");
  for (const button of measured.longGroup.buttons) {
    // WebKit lays out the -1px attached overlap on a 1/64px grid.
    expect(button.left).toBeGreaterThanOrEqual(-0.5);
    expect(button.right).toBeGreaterThanOrEqual(-0.5);
    expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
  }

  const [lone] = measured.loneGroup.buttons;
  expect(new Set(lone!.radii).size).toBe(1);
  expect(lone!.radii[0]).not.toBe("0px");

  for (const [testId, inset] of Object.entries(measured.insets)) {
    expect(inset.start, `${testId} start inset`).toBeGreaterThanOrEqual(20);
    expect(inset.end, `${testId} end inset`).toBeGreaterThanOrEqual(20);
  }
  expect(measured.cardButtonPadding).toBe(measured.referenceButtonPadding);
  expect(measured.inputFitsCard).toBe(true);
});

test("should join vertical ButtonGroups on the block axis at desktop width", async ({
  page,
  render,
  root,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await render("verticalGroups");

  const radii = await root.evaluate((container) => {
    const radiiOf = (selector: string): string[][] =>
      [...container.querySelectorAll<HTMLElement>(`${selector} [data-slot="button"]`)].map(
        (button) => {
          const style = getComputedStyle(button);
          return [
            style.borderTopLeftRadius,
            style.borderTopRightRadius,
            style.borderBottomRightRadius,
            style.borderBottomLeftRadius,
          ];
        },
      );
    return {
      group: radiiOf('[data-testid="vertical-group"]'),
      lone: radiiOf('[data-testid="vertical-lone"]'),
    };
  });

  const [first, middle, last] = radii.group;
  expect(first![0]).toBe(first![1]);
  expect(first![0]).not.toBe("0px");
  expect(first!.slice(2)).toEqual(["0px", "0px"]);
  expect(middle).toEqual(["0px", "0px", "0px", "0px"]);
  expect(last!.slice(0, 2)).toEqual(["0px", "0px"]);
  expect(last![2]).toBe(last![3]);
  expect(last![2]).not.toBe("0px");
  expect(new Set(radii.lone[0]).size).toBe(1);
  expect(radii.lone[0]![0]).not.toBe("0px");
});

test("should keep component props and every action visible inside narrow desktop containers", async ({
  page,
  render,
  root,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await render("componentProps");

  const measured = await root.evaluate((container) => {
    const find = (testId: string): HTMLElement =>
      container.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
    const card = find("prop-card").getBoundingClientRect();
    const block = find("centered-block").getBoundingClientRect();
    const narrow = find("narrow-group");
    const narrowBox = narrow.getBoundingClientRect();
    const vertical = [
      ...find("mixed-vertical").querySelectorAll<HTMLElement>('[data-slot="button"]'),
    ];
    const padding = (testId: string): string => getComputedStyle(find(testId)).paddingInlineStart;

    return {
      blockWidth: block.width,
      cardWidth: card.width,
      blockCenterOffset: Math.abs(block.left + block.width / 2 - (card.left + card.width / 2)),
      hiddenEmptyDisplay: getComputedStyle(find("hidden-empty")).display,
      flushEmptyPadding: getComputedStyle(find("flush-empty")).paddingInlineStart,
      groupedLargePadding: padding("grouped-large"),
      referenceLargePadding: padding("reference-large"),
      narrowOverflow: getComputedStyle(narrow).overflow,
      narrowButtons: [...narrow.querySelectorAll<HTMLElement>('[data-slot="button"]')].map(
        (button) => {
          const box = button.getBoundingClientRect();
          return { left: box.left - narrowBox.left, right: narrowBox.right - box.right };
        },
      ),
      narrowResponsive: narrow.dataset.responsive,
      explicitResponsive: find("explicit-row").dataset.responsive,
      detachedResponsive: find("detached-group").dataset.responsive,
      optedInDirection: getComputedStyle(find("opted-in-group")).flexDirection,
      optedInResponsive: find("opted-in-group").dataset.responsive,
      verticalWidths: vertical.map((button) => button.getBoundingClientRect().width),
    };
  });

  expect(measured.blockWidth).toBeLessThan(measured.cardWidth - 100);
  expect(measured.blockCenterOffset).toBeLessThanOrEqual(1);
  expect(measured.hiddenEmptyDisplay).toBe("none");
  expect(measured.flushEmptyPadding).toBe("0px");
  expect(measured.groupedLargePadding).toBe(measured.referenceLargePadding);
  expect(measured.narrowOverflow).toBe("visible");
  for (const button of measured.narrowButtons) {
    // WebKit lays out the -1px attached overlap on a 1/64px grid.
    expect(button.left).toBeGreaterThanOrEqual(-0.5);
    expect(button.right).toBeGreaterThanOrEqual(-0.5);
  }
  expect(measured.narrowResponsive).toBe("true");
  expect(measured.explicitResponsive).toBeUndefined();
  expect(measured.detachedResponsive).toBeUndefined();
  expect(measured.optedInResponsive).toBe("true");
  expect(measured.optedInDirection).toBe("row");
  expect(new Set(measured.verticalWidths).size).toBe(1);
});

test("should keep focus, disabled, and inset contracts across raw markup", async ({
  page,
  markup,
  root,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await markup(`
    <div style="width: 320px">
      <input data-slot="input" data-testid="enabled-input" />
      <input data-slot="input" disabled data-testid="disabled-input" />
      <div data-slot="button-group" data-attached="true" data-orientation="vertical">
        <button data-slot="button" data-testid="focus-first">First</button>
        <button data-slot="button">Second</button>
      </div>
      <div class="btn-group-vertical" data-attached="true" data-testid="alias-only">
        <button class="btn">One</button>
        <button class="btn">Two</button>
        <button class="btn">Three</button>
      </div>
      <button data-slot="button" disabled data-testid="disabled-button">Disabled</button>
      <button data-slot="button" data-testid="enabled-button">Enabled</button>
      <section data-slot="empty-state" hidden data-testid="hidden-raw-empty">Hidden</section>
      <table><tbody><tr><td data-slot="empty-state" colspan="2" data-testid="cell-empty">No rows</td></tr></tbody></table>
      <div data-slot="dialog-content"><div data-slot="card-content" data-testid="loose-section">Loose</div></div>
      <article data-slot="card" data-testid="nested-card">
        <div data-slot="card-content" data-testid="direct-section">Direct</div>
        <form><div data-slot="card-content" data-testid="nested-section">Nested</div></form>
      </article>
      <article data-slot="card" style="--ak-card-inset: 12px" data-testid="custom-inset">
        <nav data-slot="menu-content" data-testid="card-menu"><a data-slot="menu-item">Item</a></nav>
      </article>
    </div>
  `);
  // A key press first makes the programmatic focus count as keyboard focus.
  await page.keyboard.press("Shift");
  await page.getByTestId("focus-first").focus();

  const measured = await root.evaluate((container) => {
    const find = (testId: string): HTMLElement =>
      container.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
    const card = find("custom-inset").getBoundingClientRect();
    const menu = find("card-menu").getBoundingClientRect();
    const border = Number.parseFloat(getComputedStyle(find("custom-inset")).borderInlineStartWidth);
    return {
      enabledColor: getComputedStyle(find("enabled-input")).color,
      disabledColor: getComputedStyle(find("disabled-input")).color,
      focusZ: getComputedStyle(find("focus-first")).zIndex,
      focusShadow: getComputedStyle(find("focus-first")).boxShadow,
      disabledButtonCursor: getComputedStyle(find("disabled-button")).cursor,
      nestedSectionStart:
        find("nested-section").getBoundingClientRect().left -
        find("nested-card").getBoundingClientRect().left,
      directSectionStart:
        find("direct-section").getBoundingClientRect().left -
        find("nested-card").getBoundingClientRect().left,
      disabledButtonColor: getComputedStyle(find("disabled-button")).color,
      enabledButtonColor: getComputedStyle(find("enabled-button")).color,
      buttonFont: getComputedStyle(find("enabled-button")).fontFamily,
      bodyFont: getComputedStyle(container).fontFamily,
      hiddenEmptyDisplay: getComputedStyle(find("hidden-raw-empty")).display,
      cellEmptyDisplay: getComputedStyle(find("cell-empty")).display,
      looseSectionPadding: getComputedStyle(find("loose-section")).paddingInlineStart,
      aliasMarginTop: getComputedStyle(find("alias-only").children[1] as HTMLElement)
        .marginBlockStart,
      menuStart: menu.left - card.left - border,
      menuEnd: card.right - menu.right - border,
    };
  });

  expect(measured.disabledColor).not.toBe(measured.enabledColor);
  expect(measured.focusZ).toBe("auto");
  expect(measured.focusShadow).toContain("inset");
  expect(measured.disabledButtonCursor).toBe("not-allowed");
  expect(measured.nestedSectionStart).toBe(measured.directSectionStart);
  expect(measured.disabledButtonColor).not.toBe(measured.enabledButtonColor);
  expect(measured.buttonFont).toBe(measured.bodyFont);
  expect(measured.hiddenEmptyDisplay).toBe("none");
  expect(measured.cellEmptyDisplay).toBe("table-cell");
  expect(Number.parseFloat(measured.looseSectionPadding)).toBeGreaterThanOrEqual(20);
  expect(measured.aliasMarginTop).toBe("0px");
  expect(Math.abs(measured.menuStart)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(measured.menuEnd)).toBeLessThanOrEqual(0.5);
});
