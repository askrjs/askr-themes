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
      <div data-slot="empty-state" popover data-testid="popover-empty">Popover</div>
      <label data-slot="label" style="font-weight: 600; font-style: italic; font-family: serif">Email <input data-slot="input" data-testid="label-input" /></label>
      <article data-slot="card" data-testid="sep-card"><hr data-slot="separator" data-bleed data-testid="sep" /></article>
      <section style="--ak-space-2xl: 1rem"><article data-slot="card" data-testid="scoped-card">Scoped</article></section>
      <article data-slot="card"><nav data-slot="menu-content" data-bleed="false" data-testid="framed-menu"><a data-slot="menu-item">Item</a></nav></article>
      <div class="btn-group-vertical" data-slot="button-group" data-attached="true" data-testid="mixed-alias">
        <button data-slot="button">One</button><button data-slot="button">Two</button>
      </div>
      <div class="card" data-testid="alias-card"><nav data-slot="menu-content" data-testid="alias-menu"><a data-slot="menu-item">Item</a></nav></div>
      <button data-slot="radio-group-item" disabled data-testid="disabled-radio"></button>
      <article data-slot="card"><div data-slot="popover-content"><div data-slot="card-content" data-testid="popover-section">Pop</div></div></article>
      <article data-slot="card"><div data-slot="nav-dropdown-content"><div data-slot="card-content" data-testid="nav-section">Nav</div></div></article>
      <div class="card" data-slot="popover-content" data-testid="card-popover"><div data-slot="card-header" data-testid="card-popover-header">Head</div></div>
      <article data-slot="card" data-testid="bleed-card"><div data-bleed data-testid="bleed-child">Media</div></article>
      <article data-slot="card" data-testid="table-card"><table data-slot="table" data-bleed data-testid="bleed-table"><tbody><tr><td>Cell</td></tr></tbody></table></article>
      <table><tbody><tr data-slot="empty-state" data-testid="row-empty"><td colspan="2">No rows</td></tr></tbody></table>
      <button data-slot="checkbox" data-state="checked" disabled data-testid="disabled-checkbox"></button>
      <textarea data-slot="textarea" data-disabled data-testid="soft-disabled-textarea"></textarea>
      <textarea data-slot="textarea" data-disabled disabled data-testid="native-disabled-textarea"></textarea>
      <button data-slot="switch" data-state="checked" disabled data-testid="disabled-switch"></button>
      <article data-slot="card" style="--ak-card-inset: 0px" data-testid="flush-card">
        <article data-slot="card" data-testid="inner-card"><div data-slot="card-content" data-testid="inner-content">Inner</div></article>
      </article>
      <style>:where(.app-pad [data-slot="card-content"]) { padding-inline: 10px; }</style>
      <div class="app-pad"><article data-slot="card"><div data-slot="card-content" data-testid="app-padded-section">App</div></article></div>
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
      rowEmptyDisplay: getComputedStyle(find("row-empty")).display,
      popoverEmptyDisplay: getComputedStyle(find("popover-empty")).display,
      labelInputFamily: getComputedStyle(find("label-input")).fontFamily,
      sepStart:
        find("sep").getBoundingClientRect().left - find("sep-card").getBoundingClientRect().left,
      sepEnd:
        find("sep-card").getBoundingClientRect().right - find("sep").getBoundingClientRect().right,
      scopedPadding: [
        getComputedStyle(find("scoped-card")).paddingInlineStart,
        getComputedStyle(find("scoped-card")).paddingBlockStart,
      ],
      aliasMenuStart:
        find("alias-menu").getBoundingClientRect().left -
        find("alias-card").getBoundingClientRect().left,
      aliasMenuBorder: getComputedStyle(find("alias-menu")).borderInlineStartWidth,
      framedMenuBorder: getComputedStyle(find("framed-menu")).borderInlineStartWidth,
      mixedAliasSecond: getComputedStyle(find("mixed-alias").children[1] as HTMLElement)
        .marginBlockStart,
      disabledRadioPointer: getComputedStyle(find("disabled-radio")).pointerEvents,
      popoverSectionPadding: getComputedStyle(find("popover-section")).paddingInlineStart,
      navSectionPadding: getComputedStyle(find("nav-section")).paddingInlineStart,
      cardPopoverHeaderStart:
        find("card-popover-header").getBoundingClientRect().left -
        find("card-popover").getBoundingClientRect().left +
        Number.parseFloat(getComputedStyle(find("card-popover-header")).paddingInlineStart),
      tableStart:
        find("bleed-table").getBoundingClientRect().left -
        find("table-card").getBoundingClientRect().left,
      tableEnd:
        find("table-card").getBoundingClientRect().right -
        find("bleed-table").getBoundingClientRect().right,
      bleedStart:
        find("bleed-child").getBoundingClientRect().left -
        find("bleed-card").getBoundingClientRect().left,
      bleedEnd:
        find("bleed-card").getBoundingClientRect().right -
        find("bleed-child").getBoundingClientRect().right,
      disabledCheckboxImage: getComputedStyle(find("disabled-checkbox")).backgroundImage,
      softDisabledPointer: getComputedStyle(find("soft-disabled-textarea")).pointerEvents,
      nativeDisabledPointer: getComputedStyle(find("native-disabled-textarea")).pointerEvents,
      nativeDisabledResize: getComputedStyle(find("native-disabled-textarea")).resize,
      switchThumb: getComputedStyle(find("disabled-switch"), "::after").backgroundColor,
      switchTrack: getComputedStyle(find("disabled-switch")).backgroundColor,
      innerInset:
        find("inner-content").getBoundingClientRect().left -
        find("inner-card").getBoundingClientRect().left,
      appPaddedSection: getComputedStyle(find("app-padded-section")).paddingInlineStart,
      looseSectionPadding: getComputedStyle(find("loose-section")).paddingInlineStart,
      aliasMarginTop: getComputedStyle(find("alias-only").children[1] as HTMLElement)
        .marginBlockStart,
      menuStart: menu.left - card.left - border,
      menuEnd: card.right - menu.right - border,
    };
  });

  expect(measured.disabledColor).not.toBe(measured.enabledColor);
  expect(measured.focusZ).toBe("1");
  expect(measured.nestedSectionStart).toBe(measured.directSectionStart);
  expect(measured.disabledButtonColor).not.toBe(measured.enabledButtonColor);
  expect(measured.buttonFont).toBe(measured.bodyFont);
  expect(measured.hiddenEmptyDisplay).toBe("none");
  expect(measured.cellEmptyDisplay).toBe("table-cell");
  expect(measured.rowEmptyDisplay).toBe("table-row");
  expect(measured.popoverEmptyDisplay).toBe("none");
  expect(measured.labelInputFamily).toBe("serif");
  expect(measured.sepStart).toBeLessThanOrEqual(1.5);
  expect(measured.sepEnd).toBeLessThanOrEqual(1.5);
  expect(measured.scopedPadding[0]).toBe(measured.scopedPadding[1]);
  expect(measured.aliasMenuStart).toBeLessThanOrEqual(1.5);
  expect(measured.aliasMenuBorder).toBe("0px");
  expect(measured.framedMenuBorder).toBe("1px");
  expect(measured.mixedAliasSecond).toBe("-1px");
  expect(measured.disabledRadioPointer).toBe("none");
  expect(Number.parseFloat(measured.popoverSectionPadding)).toBeGreaterThanOrEqual(20);
  expect(Number.parseFloat(measured.navSectionPadding)).toBeGreaterThanOrEqual(20);
  expect(measured.cardPopoverHeaderStart).toBeLessThan(50);
  expect(measured.tableStart).toBeGreaterThanOrEqual(0);
  expect(measured.tableStart).toBeLessThanOrEqual(1.5);
  expect(measured.tableEnd).toBeGreaterThanOrEqual(0);
  expect(measured.tableEnd).toBeLessThanOrEqual(1.5);
  expect(measured.bleedStart).toBeLessThanOrEqual(1.5);
  expect(measured.bleedEnd).toBeLessThanOrEqual(1.5);
  expect(measured.disabledCheckboxImage).not.toBe("none");
  expect(measured.softDisabledPointer).toBe("none");
  expect(measured.nativeDisabledPointer).toBe("auto");
  expect(measured.nativeDisabledResize).toBe("none");
  expect(measured.switchThumb).not.toBe(measured.switchTrack);
  // --ak-card-inset inherits like any token, so the nested card is flush too.
  expect(measured.innerInset).toBeLessThanOrEqual(2);
  expect(measured.appPaddedSection).toBe("10px");
  expect(Number.parseFloat(measured.looseSectionPadding)).toBeGreaterThanOrEqual(20);
  expect(measured.aliasMarginTop).toBe("-1px");
  expect(Math.abs(measured.menuStart)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(measured.menuEnd)).toBeLessThanOrEqual(0.5);
});

test("should keep disabled checkbox marks readable against their fill", async ({
  markup,
  root,
}) => {
  await markup(`
    <div>
      <button data-slot="checkbox" data-state="checked" disabled data-testid="native"></button>
      <button data-slot="checkbox" data-state="checked" data-disabled data-testid="component"></button>
      <button data-slot="switch" data-state="checked" disabled data-testid="switch"></button>
    </div>
  `);

  const ratios = await root.evaluate((container) => {
    const toRgb = (color: string): number[] => {
      const canvas = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
      canvas.fillStyle = color;
      canvas.fillRect(0, 0, 1, 1);
      return [...canvas.getImageData(0, 0, 1, 1).data].slice(0, 3);
    };
    const luminance = (rgb: number[]): number => {
      const [r, g, b] = rgb.map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
    };
    const contrast = (a: string, b: string): number => {
      const [hi, lo] = [luminance(toRgb(a)), luminance(toRgb(b))].sort((x, y) => y - x);
      return (hi! + 0.05) / (lo! + 0.05);
    };
    const find = (id: string): HTMLElement =>
      container.querySelector(`[data-testid="${id}"]`) as HTMLElement;
    const markOn = (id: string) => {
      const style = getComputedStyle(find(id));
      // Resolve the mark variable the checkbox actually paints with.
      const probe = document.createElement("span");
      probe.style.color = style.getPropertyValue("--_checkbox-mark");
      find(id).append(probe);
      const mark = getComputedStyle(probe).color;
      probe.remove();
      return contrast(mark, style.backgroundColor);
    };
    const switchStyle = getComputedStyle(find("switch"));
    return [
      markOn("native"),
      markOn("component"),
      contrast(
        getComputedStyle(find("switch"), "::after").backgroundColor,
        switchStyle.backgroundColor,
      ),
    ];
  });

  for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(3);
});

test("should show hover on muted pill and toggle tracks", async ({ page, markup }) => {
  await markup(`
    <div>
      <div data-slot="toggle-group" data-testid="toggle-track">
        <button data-slot="toggle-group-item" data-testid="toggle-item">Day</button>
      </div>
      <div data-slot="pills" data-testid="pill-track">
        <button data-slot="pill" data-testid="pill-item">All</button>
      </div>
    </div>
  `);
  for (const [track, item] of [
    ["toggle-track", "toggle-item"],
    ["pill-track", "pill-item"],
  ] as const) {
    await page.getByTestId(item).hover();
    // Poll so the background transition settles before comparing fills.
    await expect
      .poll(() =>
        Promise.all([
          page.getByTestId(track).evaluate((el) => getComputedStyle(el).backgroundColor),
          page.getByTestId(item).evaluate((el) => getComputedStyle(el).backgroundColor),
        ]).then(
          ([trackFill, itemFill]) => itemFill !== trackFill && itemFill !== "rgba(0, 0, 0, 0)",
        ),
      )
      .toBe(true);
  }
});

test("should keep selected fills distinct from hover across lists, rows, and navigation", async ({
  page,
  markup,
}) => {
  await markup(`
    <div>
      <div data-slot="select-item" data-state="checked" data-testid="checked-option">Chosen</div>
      <div data-slot="select-item" data-testid="plain-option">Other</div>
      <table><tbody>
        <tr data-slot="table-row" data-state="selected" data-testid="selected-row"><td>A</td></tr>
        <tr data-slot="table-row" data-testid="plain-row"><td>B</td></tr>
      </tbody></table>
      <button data-slot="sidebar-menu-button" data-active="true" data-testid="active-sidebar">Home</button>
    </div>
  `);

  const fill = (id: string) =>
    page.getByTestId(id).evaluate((el) => getComputedStyle(el).backgroundColor);
  const token = (name: string) =>
    page.evaluate((variable) => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = `var(${variable})`;
      document.body.append(probe);
      const value = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return value;
    }, name);
  const [selected, hover] = await Promise.all([
    token("--ak-color-selected"),
    token("--ak-color-hover"),
  ]);
  expect(selected).not.toBe(hover);

  expect(await fill("checked-option")).toBe(selected);
  expect(await fill("selected-row")).toBe(selected);
  expect(await fill("active-sidebar")).toBe(selected);

  for (const id of ["plain-option", "plain-row"]) {
    await page.getByTestId(id).hover();
    // Poll so background transitions settle before comparing with the hover token.
    await expect.poll(() => fill(id)).toBe(hover);
  }
});
