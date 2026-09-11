import type { Page } from "@playwright/test";

import { THEME_FAMILY_AUDIT_SELECTORS } from "../fixtures/component-audit-matrix";
import { expect, test } from "./fixtures";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

/**
 * The vitest original mounted `/visual-check.html` inside a fixed-width iframe.
 * Playwright can size the real viewport instead, which exercises the same
 * width-dependent layout without an extra browsing context in the way.
 */
async function openAudit(page: Page, width: number): Promise<void> {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/visual-check.html");
  await page.locator(".component-card").first().waitFor();
}

async function setDirection(page: Page, direction: "ltr" | "rtl"): Promise<void> {
  await page.evaluate((value) => {
    document.documentElement.dir = value;
    document.documentElement.getBoundingClientRect();
  }, direction);
}

test.describe("visual polish contracts", () => {
  test("should keep the complete audit surface geometrically sound across theme, direction, and width permutations", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    for (const width of [320, 768, 1440]) {
      await openAudit(page, width);

      for (const direction of ["ltr", "rtl"] as const) {
        await setDirection(page, direction);

        for (const theme of ["light", "dark"] as const) {
          const audit = await page.evaluate(
            ([themeName, familySelectors]) => {
              const selectors = familySelectors as Record<string, string>;
              const previews = [
                ...document.querySelectorAll<HTMLElement>(`.preview[data-theme="${themeName}"]`),
              ];

              const missingFamilies = Object.entries(selectors)
                .filter(
                  ([, selector]) =>
                    document.querySelector(`.preview[data-theme="${themeName}"] ${selector}`) ===
                    null,
                )
                .map(([family]) => family);

              const previewOverflows = previews
                .filter((preview) => preview.scrollWidth > preview.clientWidth + 1)
                .map(
                  (preview) =>
                    preview.closest(".audit-card")?.querySelector("h3")?.textContent ?? "",
                );

              const slots = [
                ...document.querySelectorAll<HTMLElement>(
                  `.preview[data-theme="${themeName}"] [data-slot]`,
                ),
              ].filter((element) => {
                const style = getComputedStyle(element);
                return (
                  style.display !== "none" &&
                  style.visibility !== "hidden" &&
                  element.checkVisibility()
                );
              });

              const nonFiniteWidth: string[] = [];
              const nonFiniteHeight: string[] = [];
              const nonPositiveWidth: string[] = [];
              const nonPositiveHeight: string[] = [];
              for (const element of slots) {
                const bounds = element.getBoundingClientRect();
                if (!Number.isFinite(bounds.width)) nonFiniteWidth.push(element.outerHTML);
                if (!Number.isFinite(bounds.height)) nonFiniteHeight.push(element.outerHTML);
                if (element.dataset.slot !== "virtual-list-spacer") {
                  if (!(bounds.width > 0)) nonPositiveWidth.push(element.outerHTML);
                  if (!(bounds.height > 0)) nonPositiveHeight.push(element.outerHTML);
                }
              }

              const virtualList = document.querySelector<HTMLElement>(
                `.preview[data-theme="${themeName}"] [data-slot="virtual-list"]`,
              )!;
              const virtualRows = [
                ...virtualList.querySelectorAll<HTMLElement>('[data-slot="virtual-list-row"]'),
              ];
              const virtualSpacers = [
                ...virtualList.querySelectorAll<HTMLElement>('[data-slot="virtual-list-spacer"]'),
              ];

              return {
                previewCount: previews.length,
                missingFamilies,
                previewOverflows,
                slotCount: slots.length,
                nonFiniteWidth,
                nonFiniteHeight,
                nonPositiveWidth,
                nonPositiveHeight,
                virtualScrollHeight: virtualList.scrollHeight,
                virtualClientHeight: virtualList.clientHeight,
                virtualRowCount: virtualRows.length,
                virtualSpacerCount: virtualSpacers.length,
                flatSpacers: virtualSpacers
                  .filter((spacer) => !(spacer.getBoundingClientRect().height > 0))
                  .map((spacer) => spacer.outerHTML),
                overflowingRows: virtualRows
                  .filter((row) => row.scrollWidth > virtualList.clientWidth)
                  .map((row) => row.outerHTML),
              };
            },
            [theme, THEME_FAMILY_AUDIT_SELECTORS] as const,
          );

          await test.step(`${theme} ${direction} at ${width}px`, () => {
            expect(audit.previewCount, `${theme} preview count`).toBeGreaterThan(0);
            expect(audit.missingFamilies, `${theme} is missing rendered families`).toEqual([]);
            expect(audit.previewOverflows, `${theme} ${direction} overflow`).toEqual([]);
            expect(audit.slotCount, `${theme} slot count`).toBeGreaterThan(100);
            expect(audit.nonFiniteWidth).toEqual([]);
            expect(audit.nonFiniteHeight).toEqual([]);
            expect(audit.nonPositiveWidth).toEqual([]);
            expect(audit.nonPositiveHeight).toEqual([]);
            expect(audit.virtualScrollHeight).toBeGreaterThan(audit.virtualClientHeight);
            expect(audit.virtualRowCount).toBe(2);
            expect(audit.virtualSpacerCount).toBe(2);
            expect(audit.flatSpacers).toEqual([]);
            expect(audit.overflowingRows).toEqual([]);
          });
        }
      }
    }
  });

  test("should keep core interactive controls on one shared density rhythm", async ({
    markup,
    root,
  }) => {
    await markup(`
      <button class="btn" data-slot="button">Save</button>
      <input class="input" data-slot="input" value="hello" />
      <button class="select-trigger" data-slot="select-trigger">
        <span data-slot="select-value">Production</span>
      </button>
      <button data-slot="dropdown-trigger">Dropdown</button>
    `);

    const controls = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      return [...container.children].map((control) => {
        const style = getComputedStyle(control);
        return {
          html: control.outerHTML,
          minHeight: px(style.minHeight),
          paddingInlineStart: px(style.paddingInlineStart),
          borderRadius: px(style.borderRadius),
          fontSize: style.fontSize,
        };
      });
    });

    expect(new Set(controls.map((control) => control.minHeight))).toEqual(new Set([36]));

    for (const control of controls) {
      await test.step(control.html, () => {
        expect(control.paddingInlineStart).toBeGreaterThanOrEqual(12);
        expect(control.borderRadius).toBeGreaterThanOrEqual(6);
        expect(control.fontSize).toBe("14px");
      });
    }
  });

  test("should keep dropdown and select rows aligned and compact", async ({ markup, root }) => {
    await markup(`
      <div data-slot="dropdown-content">
        <button data-slot="dropdown-item">Profile</button>
      </div>
      <div data-slot="select-content">
        <button data-slot="select-item">Production</button>
      </div>
    `);

    const rows = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      return ['[data-slot="dropdown-item"]', '[data-slot="select-item"]'].map((selector) => {
        const row = container.querySelector(selector) as HTMLElement;
        const style = getComputedStyle(row);
        return {
          html: row.outerHTML,
          minHeight: px(style.minHeight),
          paddingInlineStart: px(style.paddingInlineStart),
          alignItems: style.alignItems,
        };
      });
    });

    for (const row of rows) {
      await test.step(row.html, () => {
        expect(row.minHeight).toBe(32);
        expect(row.paddingInlineStart).toBeGreaterThanOrEqual(8);
        expect(row.alignItems).toBe("center");
      });
    }
  });

  test("should reset select popup items so native button chrome does not leak through", async ({
    markup,
    page,
    root,
  }) => {
    await markup(`
      <div data-slot="select-content">
        <button data-slot="select-item" data-state="checked">Production</button>
        <button data-slot="select-item">Preview</button>
      </div>
    `);
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

    const style = await root.evaluate((container) => {
      const selectItem = container.querySelector(
        '[data-slot="select-item"]:not([data-state="checked"])',
      ) as HTMLElement;
      const computed = getComputedStyle(selectItem);
      return {
        backgroundColor: computed.backgroundColor,
        borderTopStyle: computed.borderTopStyle,
        borderTopWidth: Number.parseFloat(computed.borderTopWidth.replace("px", "")),
        textAlign: computed.textAlign,
      };
    });

    expect(style.backgroundColor).toBe(TRANSPARENT);
    expect(style.borderTopStyle).toBe("none");
    expect(style.borderTopWidth).toBe(0);
    expect(style.textAlign).toBe("start");
  });

  test("should keep dark overlay surfaces dark, elevated, and readable", async ({
    markup,
    page,
    root,
  }) => {
    await markup(`
      <section data-slot="dialog-content">
        <h2 data-slot="dialog-title">Dialog</h2>
        <p data-slot="dialog-description">Readable copy.</p>
      </section>
      <section data-slot="popover-content">Popover</section>
      <div data-slot="tooltip-content">Tooltip</div>
      <div data-slot="toast"><strong data-slot="toast-title">Toast</strong></div>
    `);
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

    const surfaces = await root.evaluate((container) =>
      [
        '[data-slot="dialog-content"]',
        '[data-slot="popover-content"]',
        '[data-slot="tooltip-content"]',
        '[data-slot="toast"]',
      ].map((selector) => {
        const style = getComputedStyle(container.querySelector(selector) as HTMLElement);
        return {
          selector,
          backgroundColor: style.backgroundColor,
          boxShadow: style.boxShadow,
          borderTopLeftRadius: Number.parseFloat(style.borderTopLeftRadius.replace("px", "")),
        };
      }),
    );

    for (const surface of surfaces) {
      await test.step(surface.selector, () => {
        expect(surface.backgroundColor).not.toBe(TRANSPARENT);
        expect(surface.backgroundColor).not.toBe("rgb(255, 255, 255)");
        if (surface.selector === '[data-slot="tooltip-content"]') {
          expect(surface.boxShadow).toBe("none");
        } else {
          expect(surface.boxShadow).not.toBe("none");
        }
        expect(surface.borderTopLeftRadius).toBeGreaterThanOrEqual(8);
      });
    }
  });

  test("should protect dense surfaces from collapsed spacing and long-label overflow", async ({
    markup,
    page,
    root,
  }) => {
    // The vitest browser runner defaulted to a 414x896 page, so the
    // `(max-width: 30rem)` branch below is the one this contract has always
    // asserted. Keep that viewport rather than silently switching branches.
    await page.setViewportSize({ width: 414, height: 896 });
    await markup(`
      <article class="card" data-slot="card">
        <h3>A long card title that needs polish</h3>
        <p>
          Supporting copy should fit without losing rhythm.
        </p>
      </article>
      <table data-slot="table">
        <thead data-slot="table-head">
          <tr data-slot="table-row">
            <th data-slot="table-header-cell">Name</th>
            <th data-slot="table-header-cell">Role</th>
            <th data-slot="table-header-cell">Status</th>
          </tr>
        </thead>
        <tbody data-slot="table-body">
          <tr data-slot="table-row"><td data-slot="table-cell">Cell</td></tr>
        </tbody>
      </table>
    `);

    const measured = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const card = container.querySelector('[data-slot="card"]') as HTMLElement;
      const tableCell = container.querySelector('[data-slot="table-cell"]') as HTMLElement;
      const cellStyle = getComputedStyle(tableCell);
      return {
        minTablePadding: window.matchMedia("(max-width: 30rem)").matches ? 4 : 10,
        cardGap: px(getComputedStyle(card).gap),
        cellPaddingBlockStart: px(cellStyle.paddingBlockStart),
        cellPaddingInlineStart: px(cellStyle.paddingInlineStart),
        headers: [...container.querySelectorAll('[data-slot="table-header-cell"]')].map(
          (header) => ({
            label: header.textContent ?? "",
            whiteSpace: getComputedStyle(header).whiteSpace,
          }),
        ),
      };
    });

    expect(measured.cardGap).toBeGreaterThanOrEqual(12);
    expect(measured.cellPaddingBlockStart).toBeGreaterThanOrEqual(measured.minTablePadding);
    expect(measured.cellPaddingInlineStart).toBeGreaterThanOrEqual(measured.minTablePadding);

    for (const header of measured.headers) {
      await test.step(header.label, () => {
        expect(header.whiteSpace).toBe("normal");
      });
    }
  });

  test("should give disclosure and scroll primitives usable default polish", async ({
    markup,
    root,
  }) => {
    await markup(`
      <div data-slot="accordion">
        <div data-slot="accordion-item" data-state="open">
          <h3 data-slot="accordion-header">
            <button data-slot="accordion-trigger" data-state="open">
              Verification notes
            </button>
          </h3>
          <div data-slot="accordion-content">
            Long implementation copy should inherit compact readable spacing.
          </div>
        </div>
      </div>
      <div data-slot="scroll-area-viewport" data-size="content" tabindex="0">
        <div style="height: 900px; width: 900px;">Dense audit data</div>
      </div>
    `);

    const measured = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const trigger = container.querySelector('[data-slot="accordion-trigger"]') as HTMLElement;
      const content = container.querySelector('[data-slot="accordion-content"]') as HTMLElement;
      const viewport = container.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      const viewportStyle = getComputedStyle(viewport);
      return {
        triggerDisplay: getComputedStyle(trigger).display,
        triggerMinHeight: px(getComputedStyle(trigger).minHeight),
        contentColor: getComputedStyle(content).color,
        viewportOverflowX: viewportStyle.overflowX,
        viewportOverflowY: viewportStyle.overflowY,
        viewportScrollHeight: viewport.scrollHeight,
        viewportClientHeight: viewport.clientHeight,
      };
    });

    expect(measured.triggerDisplay).toBe("flex");
    expect(measured.triggerMinHeight).toBeGreaterThanOrEqual(36);
    expect(measured.contentColor).not.toBe(TRANSPARENT);
    expect(measured.viewportOverflowX).toBe("auto");
    expect(measured.viewportOverflowY).toBe("auto");
    expect(measured.viewportScrollHeight).toBeGreaterThan(measured.viewportClientHeight);
  });

  test("should give slider, toggles, hover cards, and menubars usable default polish", async ({
    markup,
    root,
  }) => {
    await markup(`
      <div style="width: 320px; overflow: auto;">
        <div data-slot="slider" data-orientation="horizontal" style="--ak-slider-percentage: 60%;">
          <div data-slot="slider-track">
            <div data-slot="slider-range"></div>
            <div data-slot="slider-thumb"></div>
          </div>
        </div>
        <div data-slot="toggle-group" data-orientation="horizontal">
          <button data-slot="toggle-group-item" data-state="on">Comfortable</button>
          <button data-slot="toggle-group-item" data-state="off">Compact</button>
        </div>
        <button data-slot="toggle" data-state="on">Pinned</button>
        <button data-tooltip="Open route details" data-tooltip-side="right">Icon</button>
        <button data-slot="hover-card-trigger" data-variant="plain">Destroyer SPA</button>
        <section data-slot="hover-card-content" data-state="open">Hover content</section>
        <div data-slot="menubar">
          <button data-slot="menubar-trigger" data-state="open">View</button>
          <button data-slot="menubar-trigger">Share</button>
        </div>
        <div data-slot="menubar-content" data-state="open">
          <div data-slot="menubar-label">Article</div>
          <button data-slot="menubar-item">Copy section link</button>
          <button data-slot="menubar-sub-trigger">Export</button>
          <div data-slot="menubar-separator"></div>
        </div>
      </div>
    `);

    const measured = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const wrapper = container.firstElementChild as HTMLElement;
      const find = (selector: string): HTMLElement =>
        wrapper.querySelector(selector) as HTMLElement;

      const slider = find('[data-slot="slider"]');
      const track = find('[data-slot="slider-track"]');
      const range = find('[data-slot="slider-range"]');
      const thumb = find('[data-slot="slider-thumb"]');
      const toggleGroup = find('[data-slot="toggle-group"]');
      const activeToggle = find('[data-slot="toggle-group-item"][data-state="on"]');
      const standaloneToggle = find('[data-slot="toggle"]');
      const tooltipTrigger = find("[data-tooltip]");
      const hoverTrigger = find('[data-slot="hover-card-trigger"]');
      const hoverContent = find('[data-slot="hover-card-content"]');
      const menubar = find('[data-slot="menubar"]');
      const menubarTrigger = find('[data-slot="menubar-trigger"]');
      const menubarContent = find('[data-slot="menubar-content"]');
      const menubarItem = find('[data-slot="menubar-item"]');
      const menubarSubTrigger = find('[data-slot="menubar-sub-trigger"]');

      return {
        wrapperClientWidth: wrapper.clientWidth,
        sliderScrollWidth: slider.scrollWidth,
        sliderMinHeight: px(getComputedStyle(slider).minHeight),
        trackHeight: px(getComputedStyle(track).height),
        rangeWidth: px(getComputedStyle(range).width),
        thumbWidth: px(getComputedStyle(thumb).width),
        thumbHeight: px(getComputedStyle(thumb).height),
        toggleGroupDisplay: getComputedStyle(toggleGroup).display,
        activeToggleScrollWidth: activeToggle.scrollWidth,
        activeToggleBackground: getComputedStyle(activeToggle).backgroundColor,
        standaloneToggleBackground: getComputedStyle(standaloneToggle).backgroundColor,
        tooltipTriggerScrollWidth: tooltipTrigger.scrollWidth,
        tooltipTriggerClientWidth: tooltipTrigger.clientWidth,
        hoverTriggerTextDecorationLine: getComputedStyle(hoverTrigger).textDecorationLine,
        hoverContentBackground: getComputedStyle(hoverContent).backgroundColor,
        hoverContentBoxShadow: getComputedStyle(hoverContent).boxShadow,
        hoverContentScrollWidth: hoverContent.scrollWidth,
        menubarScrollWidth: menubar.scrollWidth,
        menubarTriggerMinHeight: px(getComputedStyle(menubarTrigger).minHeight),
        menubarContentPosition: getComputedStyle(menubarContent).position,
        menubarContentBackground: getComputedStyle(menubarContent).backgroundColor,
        menubarContentBoxShadow: getComputedStyle(menubarContent).boxShadow,
        menubarItemMinHeight: px(getComputedStyle(menubarItem).minHeight),
        menubarItemTextDecorationLine: getComputedStyle(menubarItem).textDecorationLine,
        menubarSubTriggerTextDecorationLine: getComputedStyle(menubarSubTrigger).textDecorationLine,
      };
    });

    expect(measured.sliderScrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
    expect(measured.sliderMinHeight).toBe(36);
    expect(measured.trackHeight).toBe(8);
    expect(measured.rangeWidth).toBeGreaterThan(0);
    expect(measured.thumbWidth).toBeGreaterThanOrEqual(18);
    expect(measured.thumbHeight).toBeGreaterThanOrEqual(18);

    expect(measured.toggleGroupDisplay).toBe("inline-flex");
    expect(measured.activeToggleScrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
    expect(measured.activeToggleBackground).not.toBe(TRANSPARENT);
    expect(measured.standaloneToggleBackground).not.toBe(TRANSPARENT);
    expect(measured.tooltipTriggerScrollWidth).toBeLessThanOrEqual(
      measured.tooltipTriggerClientWidth,
    );

    expect(measured.hoverTriggerTextDecorationLine).toBe("none");
    expect(measured.hoverContentBackground).not.toBe(TRANSPARENT);
    expect(measured.hoverContentBoxShadow).not.toBe("none");
    expect(measured.hoverContentScrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);

    expect(measured.menubarScrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
    expect(measured.menubarTriggerMinHeight).toBe(32);
    expect(measured.menubarContentPosition).toBe("fixed");
    expect(measured.menubarContentBackground).not.toBe(TRANSPARENT);
    expect(measured.menubarContentBoxShadow).not.toBe("none");
    expect(measured.menubarItemMinHeight).toBe(32);
    expect(measured.menubarItemTextDecorationLine).toBe("none");
    expect(measured.menubarSubTriggerTextDecorationLine).toBe("none");
  });

  test("should give virtualized list and table surfaces stable default polish", async ({
    markup,
    page,
    root,
  }) => {
    await markup(`
      <div style="width: 320px; overflow: auto;">
        <div data-slot="virtual-list" data-viewport="lg">
          <div data-slot="virtual-list-row" data-visible="true" style="height: 48px;">
            <div>Route event accepted</div>
          </div>
          <div data-slot="virtual-list-row" data-visible="false" style="height: 48px;">
            <div>Background sync completed</div>
          </div>
        </div>
        <div data-slot="virtual-table" data-viewport="lg" data-table-width="compact">
          <table data-slot="virtual-table-table" tabindex="0">
            <thead data-slot="virtual-table-head">
              <tr data-slot="virtual-table-header-row">
                <th data-slot="virtual-table-header-cell">Time</th>
                <th data-slot="virtual-table-header-cell">Service</th>
                <th data-slot="virtual-table-header-cell">Message</th>
              </tr>
            </thead>
            <tbody data-slot="virtual-table-body">
              <tr data-slot="virtual-table-row" data-selected="true">
                <td data-slot="virtual-table-cell">
                  <div data-slot="virtual-table-cell-content">09:17</div>
                </td>
                <td data-slot="virtual-table-cell">
                  <div data-slot="virtual-table-cell-content">router</div>
                </td>
                <td data-slot="virtual-table-cell">
                  <div data-slot="virtual-table-cell-content">
                    Long route verification message
                  </div>
                </td>
              </tr>
              <tr data-slot="virtual-table-row" data-selected="false">
                <td data-slot="virtual-table-cell">
                  <div data-slot="virtual-table-cell-content">09:18</div>
                </td>
                <td data-slot="virtual-table-cell">
                  <div data-slot="virtual-table-cell-content">worker</div>
                </td>
                <td data-slot="virtual-table-cell">
                  <div data-slot="virtual-table-cell-content">
                    Background reconciliation completed without errors
                  </div>
                </td>
              </tr>
              <tr data-slot="virtual-table-spacer-row">
                <td style="height: 960px;"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p
          data-slot="text"
          data-font="mono"
          data-numeric="tabular"
          data-truncate="true"
        >
          09:17:00 very long text that should truncate without growing the row
        </p>
        <p data-slot="text" data-wrap="anywhere">
          SuperLongOperationalTokenWithoutNaturalBreaksShouldStillWrapInsideTheContainer
        </p>
      </div>
    `);

    const measured = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const wrapper = container.firstElementChild as HTMLElement;
      const find = (selector: string): HTMLElement =>
        wrapper.querySelector(selector) as HTMLElement;

      const list = find('[data-slot="virtual-list"]');
      const listRow = find('[data-slot="virtual-list-row"]');
      const table = find('[data-slot="virtual-table"]');
      const tableInner = find('[data-slot="virtual-table-table"]');
      const headerCell = find('[data-slot="virtual-table-header-cell"]');
      const tableHead = find('[data-slot="virtual-table-head"]');
      const selectedRow = find('[data-slot="virtual-table-row"][data-selected="true"]');
      const tableCell = find('[data-slot="virtual-table-cell"]');
      const tableCellContent = find('[data-slot="virtual-table-cell-content"]');
      const monoText = find('[data-slot="text"][data-font="mono"]');
      const wrappedText = find('[data-slot="text"][data-wrap="anywhere"]');

      return {
        wrapperClientWidth: wrapper.clientWidth,
        listScrollWidth: list.scrollWidth,
        listOverflowY: getComputedStyle(list).overflowY,
        listHeight: px(getComputedStyle(list).height),
        listBackground: getComputedStyle(list).backgroundColor,
        listRowDisplay: getComputedStyle(listRow).display,
        listRowBorderBottomWidth: px(getComputedStyle(listRow).borderBottomWidth),
        tableScrollWidth: table.scrollWidth,
        tableOverflowX: getComputedStyle(table).overflowX,
        tableHeight: px(getComputedStyle(table).height),
        tableBackground: getComputedStyle(table).backgroundColor,
        tableInnerBorderCollapse: getComputedStyle(tableInner).borderCollapse,
        tableInnerMinWidth: px(getComputedStyle(tableInner).minWidth),
        headerCellFontWeight: getComputedStyle(headerCell).fontWeight,
        tableHeadBackground: getComputedStyle(tableHead).backgroundColor,
        tableHeadBoxShadow: getComputedStyle(tableHead).boxShadow,
        headerCellColor: getComputedStyle(headerCell).color,
        tableCellColor: getComputedStyle(tableCell).color,
        selectedRowBackground: getComputedStyle(selectedRow).backgroundColor,
        selectedRowBoxShadow: getComputedStyle(selectedRow).boxShadow,
        tableCellTextOverflow: getComputedStyle(tableCell).textOverflow,
        cellContentPaddingInlineStart: px(getComputedStyle(tableCellContent).paddingInlineStart),
        cellContentAlignItems: getComputedStyle(tableCellContent).alignItems,
        cellContentTextOverflow: getComputedStyle(tableCellContent).textOverflow,
        monoFontVariantNumeric: getComputedStyle(monoText).fontVariantNumeric,
        monoTextOverflow: getComputedStyle(monoText).textOverflow,
        wrappedOverflowWrap: getComputedStyle(wrappedText).overflowWrap,
      };
    });

    expect(measured.listScrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
    expect(measured.listOverflowY).toBe("auto");
    expect(measured.listHeight).toBe(448);
    expect(measured.listBackground).not.toBe(TRANSPARENT);
    expect(measured.listRowDisplay).toBe("flex");
    expect(measured.listRowBorderBottomWidth).toBeGreaterThanOrEqual(1);

    expect(measured.tableScrollWidth).toBeGreaterThanOrEqual(measured.wrapperClientWidth);
    expect(measured.tableOverflowX).toBe("auto");
    expect(measured.tableHeight).toBe(448);
    expect(measured.tableBackground).not.toBe(TRANSPARENT);
    expect(measured.tableInnerBorderCollapse).toBe("collapse");
    expect(measured.tableInnerMinWidth).toBe(640);
    expect(measured.headerCellFontWeight).not.toBe("400");
    expect(measured.tableHeadBackground).not.toBe(TRANSPARENT);
    expect(measured.tableHeadBackground).not.toBe(measured.tableBackground);
    expect(measured.tableHeadBoxShadow).not.toBe("none");
    expect(measured.headerCellColor).not.toBe(measured.tableCellColor);
    expect(measured.selectedRowBackground).not.toBe(TRANSPARENT);
    expect(measured.selectedRowBoxShadow).not.toBe("none");

    const hoverRow = root.locator('[data-slot="virtual-table-row"][data-selected="false"]');
    await hoverRow.hover();
    await expect(hoverRow).not.toHaveCSS("background-color", TRANSPARENT);

    expect(measured.tableCellTextOverflow).toBe("ellipsis");
    expect(measured.cellContentPaddingInlineStart).toBeGreaterThanOrEqual(8);
    expect(measured.cellContentAlignItems).toBe("center");
    expect(measured.cellContentTextOverflow).toBe("ellipsis");

    await page.keyboard.press("Tab");
    const focusedSlot = await page.evaluate(
      () => (document.activeElement as HTMLElement | null)?.dataset.slot ?? null,
    );
    expect(["virtual-table", "virtual-table-table"]).toContain(focusedSlot);

    // The original read this after tabbing: the focus ring is part of the
    // contract, so keep the post-focus reading.
    await expect(root.locator('[data-slot="virtual-table"]')).not.toHaveCSS("box-shadow", "none");

    expect(measured.monoFontVariantNumeric).toContain("tabular-nums");
    expect(measured.monoTextOverflow).toBe("ellipsis");
    expect(measured.wrappedOverflowWrap).toBe("anywhere");
  });

  test("should keep supporting primitives compact, responsive, and aligned", async ({
    markup,
    root,
  }) => {
    await markup(`
      <div style="width: 320px; overflow: auto;">
        <span class="avatar" data-slot="avatar">
          <span class="avatar-fallback" data-slot="avatar-fallback">LONG</span>
        </span>
        <div data-slot="progress" aria-label="Progress" style="--ak-progress-percentage: 72%;">
          <div data-slot="progress-indicator"></div>
        </div>
        <div data-slot="progress-circle">
          <div data-slot="progress-circle-indicator"></div>
        </div>
        <div data-slot="skeleton" style="height: 18px;"></div>
        <div data-slot="separator" data-orientation="horizontal"></div>
        <div class="btn-group" data-slot="button-group" data-attached="true">
          <button class="btn btn-outline" data-slot="button">Overview</button>
          <button class="btn btn-outline" data-slot="button">Detailed operational metrics</button>
          <button class="btn btn-outline" data-slot="button">Export history</button>
        </div>
        <label class="label" data-slot="label">A deliberately long field label that can wrap</label>
        <select data-slot="theme-picker">
          <option>System appearance with long option text</option>
        </select>
      </div>
    `);

    const measured = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const wrapper = container.firstElementChild as HTMLElement;
      const find = (selector: string): HTMLElement =>
        wrapper.querySelector(selector) as HTMLElement;

      const avatar = find('[data-slot="avatar"]');
      const avatarFallback = find('[data-slot="avatar-fallback"]');
      const progress = find('[data-slot="progress"]');
      const progressCircle = find('[data-slot="progress-circle"]');
      const skeleton = find('[data-slot="skeleton"]');
      const separator = find('[data-slot="separator"]');
      const buttonGroup = find('[data-slot="button-group"]');
      const label = find('[data-slot="label"]');
      const themePicker = find('[data-slot="theme-picker"]');
      const fallbackStyle = getComputedStyle(avatarFallback);

      return {
        wrapperClientWidth: wrapper.clientWidth,
        avatarWidth: px(getComputedStyle(avatar).width),
        avatarHeight: px(getComputedStyle(avatar).height),
        avatarFlexShrink: getComputedStyle(avatar).flexShrink,
        fallbackLineHeight: fallbackStyle.lineHeight,
        fallbackOverflow: fallbackStyle.overflow,
        fallbackTextOverflow: fallbackStyle.textOverflow,
        fallbackWhiteSpace: fallbackStyle.whiteSpace,
        fallbackScrollHeight: avatarFallback.scrollHeight,
        fallbackClientHeight: avatarFallback.clientHeight,
        progressHeight: px(getComputedStyle(progress).height),
        progressScrollWidth: progress.scrollWidth,
        progressCircleFlexShrink: getComputedStyle(progressCircle).flexShrink,
        skeletonScrollWidth: skeleton.scrollWidth,
        skeletonBackgroundImage: getComputedStyle(skeleton).backgroundImage,
        separatorHeight: px(getComputedStyle(separator).height),
        buttonGroupFlexWrap: getComputedStyle(buttonGroup).flexWrap,
        buttonGroupScrollWidth: buttonGroup.scrollWidth,
        labelOverflowWrap: getComputedStyle(label).overflowWrap,
        themePickerScrollWidth: themePicker.scrollWidth,
        themePickerRenderedHeight: themePicker.getBoundingClientRect().height,
      };
    });

    expect(measured.avatarWidth).toBe(40);
    expect(measured.avatarHeight).toBe(40);
    expect(measured.avatarFlexShrink).toBe("0");
    expect(measured.fallbackLineHeight).toBe("14px");
    expect(measured.fallbackOverflow).toBe("hidden");
    expect(measured.fallbackTextOverflow).toBe("ellipsis");
    expect(measured.fallbackWhiteSpace).toBe("nowrap");
    expect(measured.fallbackScrollHeight).toBeLessThanOrEqual(measured.fallbackClientHeight);

    expect(measured.progressHeight).toBe(8);
    expect(measured.progressScrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
    expect(measured.progressCircleFlexShrink).toBe("0");

    expect(measured.skeletonScrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
    expect(measured.skeletonBackgroundImage).toContain("linear-gradient");
    expect(measured.separatorHeight).toBe(1);

    expect(measured.buttonGroupFlexWrap).toBe("nowrap");
    expect(measured.buttonGroupScrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
    expect(measured.labelOverflowWrap).toBe("anywhere");
    expect(measured.themePickerScrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
    // WebKit reports the native select's intrinsic min-height rather than the
    // resolved logical min-block-size. The rendered control is the contract.
    expect(measured.themePickerRenderedHeight).toBeGreaterThanOrEqual(36);
  });

  test("should keep status, loading, and media primitives resilient under long content", async ({
    markup,
    root,
  }) => {
    await markup(`
      <div style="width: 320px; overflow: auto;">
        <span class="badge" data-slot="badge" data-variant="info">
          <svg data-slot="icon" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="5" fill="currentColor"></circle>
          </svg>
          Long operational status badge that can wrap
        </span>
        <div class="alert" data-slot="alert" data-variant="warning">
          <div class="alert-icon" data-slot="alert-icon">!</div>
          <div class="alert-content" data-slot="alert-content">
            <h4 class="alert-title" data-slot="alert-title">
              Long alert title for production-north-america-control-plane
            </h4>
            <p class="alert-description" data-slot="alert-description">
              Alert copy should wrap without pushing the close action outside its container.
            </p>
          </div>
          <button class="btn btn-close alert-close" data-slot="alert-close">x</button>
        </div>
        <section class="empty-state" data-slot="empty-state">
          <div class="empty-state-icon" data-slot="empty-state-icon">0</div>
          <h4 class="empty-state-title" data-slot="empty-state-title">
            No matching records for selected filters
          </h4>
          <p class="empty-state-description" data-slot="empty-state-description">
            Try a shorter range or remove one very long segment name from the report.
          </p>
          <div class="empty-state-actions" data-slot="empty-state-actions">
            <button class="btn btn-primary" data-slot="button">Reset filters</button>
            <button class="btn btn-outline" data-slot="button">Save view</button>
          </div>
        </section>
        <div data-slot="aspect-ratio" style="aspect-ratio: 21 / 9;">
          <div style="width: 100%; height: 100%;">Media</div>
        </div>
        <div data-slot="progress-circle" data-state="indeterminate"></div>
      </div>
    `);

    const measured = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const wrapper = container.firstElementChild as HTMLElement;
      const find = (selector: string): HTMLElement =>
        wrapper.querySelector(selector) as HTMLElement;

      const badge = find('[data-slot="badge"]');
      const badgeIcon = find('[data-slot="badge"] [data-slot="icon"]');
      const alert = find('[data-slot="alert"]');
      const alertTitle = find('[data-slot="alert-title"]');
      const alertDescription = find('[data-slot="alert-description"]');
      const emptyState = find('[data-slot="empty-state"]');
      const emptyActions = find('[data-slot="empty-state-actions"]');
      const aspectRatio = find('[data-slot="aspect-ratio"]');
      const spinner = find('[data-slot="progress-circle"][data-state="indeterminate"]');

      return {
        wrapperClientWidth: wrapper.clientWidth,
        widths: [badge, alert, emptyState, aspectRatio, spinner].map((element) => ({
          html: element.outerHTML,
          scrollWidth: element.scrollWidth,
        })),
        badgeMaxWidth: getComputedStyle(badge).maxWidth,
        badgeOverflowWrap: getComputedStyle(badge).overflowWrap,
        badgeIconWidth: px(getComputedStyle(badgeIcon).width),
        alertMinWidth: getComputedStyle(alert).minWidth,
        alertTitleOverflowWrap: getComputedStyle(alertTitle).overflowWrap,
        alertDescriptionOverflowWrap: getComputedStyle(alertDescription).overflowWrap,
        emptyStateMinWidth: getComputedStyle(emptyState).minWidth,
        emptyActionsFlexWrap: getComputedStyle(emptyActions).flexWrap,
        aspectRatioMaxWidth: getComputedStyle(aspectRatio).maxWidth,
        spinnerWidth: px(getComputedStyle(spinner).width),
      };
    });

    for (const element of measured.widths) {
      await test.step(element.html, () => {
        expect(element.scrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
      });
    }

    expect(measured.badgeMaxWidth).toBe("100%");
    expect(measured.badgeOverflowWrap).toBe("normal");
    expect(measured.badgeIconWidth).toBe(16);
    expect(measured.alertMinWidth).toBe("0px");
    expect(measured.alertTitleOverflowWrap).toBe("anywhere");
    expect(measured.alertDescriptionOverflowWrap).toBe("anywhere");
    expect(measured.emptyStateMinWidth).toBe("0px");
    expect(measured.emptyActionsFlexWrap).toBe("wrap");
    expect(measured.aspectRatioMaxWidth).toBe("100%");
    expect(measured.spinnerWidth).toBe(36);
  });

  test("should keep the manual audit page overflow-free from mobile through desktop widths", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    for (const width of [320, 390, 768, 1024, 1440]) {
      await openAudit(page, width);

      const measured = await page.evaluate(() => {
        const root = document.documentElement;
        const overflowing = [...document.querySelectorAll("body *")]
          .filter((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.closest(".compact-table-wrap")) return false;
            const bounds = htmlEl.getBoundingClientRect();
            return bounds.left < -2 || bounds.right > root.clientWidth + 2;
          })
          .slice(0, 5)
          .map((el) => {
            const htmlEl = el as HTMLElement;
            return `${el.tagName.toLowerCase()} ${htmlEl.className} ${el.getAttribute("data-slot")}`;
          });

        return {
          overflowing,
          pageOverflow: root.scrollWidth - root.clientWidth,
          componentCards: document.querySelectorAll(".component-card").length,
        };
      });

      await test.step(`${width}px`, () => {
        expect(measured.pageOverflow, `page overflow at ${width}px`).toBe(0);
        expect(measured.overflowing, `element overflow at ${width}px`).toEqual([]);
        expect(measured.componentCards).toBeGreaterThanOrEqual(22);
      });
    }
  });

  test("should keep constrained desktop navbar brand and actions visible", async ({ page }) => {
    await openAudit(page, 1024);

    const measured = await page.evaluate(() => {
      const navbar = document.querySelector(
        '#chrome .preview[data-theme="light"] [data-slot="navbar"]',
      ) as HTMLElement;
      const brand = navbar.querySelector('[data-slot="nav-brand"]') as HTMLElement;
      const brandLink = brand.querySelector("a") as HTMLElement;
      const toggle = navbar.querySelector('[data-slot="navbar-toggle"]') as HTMLElement;
      const endGroup = navbar.querySelector('[data-visual-end-group="true"]') as HTMLElement;
      const action = endGroup.querySelector('[data-slot="button"]') as HTMLElement;

      return {
        navbarWidth: navbar.getBoundingClientRect().width,
        collapseAt: navbar.getAttribute("data-collapse-at"),
        brandWidth: brand.getBoundingClientRect().width,
        brandLinkHeight: brandLink.getBoundingClientRect().height,
        brandLinkTextDecorationLine: getComputedStyle(brandLink).textDecorationLine,
        toggleDisplay: getComputedStyle(toggle).display,
        endGroupWidth: endGroup.getBoundingClientRect().width,
        actionWidth: action.getBoundingClientRect().width,
      };
    });

    expect(measured.navbarWidth).toBeLessThan(480);
    expect(measured.collapseAt).toBe("md");
    expect(measured.brandWidth).toBeGreaterThan(20);
    expect(measured.brandLinkHeight).toBeGreaterThanOrEqual(36);
    expect(measured.brandLinkTextDecorationLine).toBe("none");
    expect(measured.toggleDisplay).toBe("none");
    expect(measured.endGroupWidth).toBeGreaterThan(0);
    expect(measured.actionWidth).toBeGreaterThanOrEqual(36);
  });

  test("should keep manual audit navbar collapsed and readable on mobile", async ({ page }) => {
    await openAudit(page, 320);

    const measured = await page.evaluate(() => {
      const navbar = document.querySelector(
        '#chrome .preview[data-theme="light"] [data-slot="navbar"]',
      ) as HTMLElement;
      const brand = navbar.querySelector('[data-slot="nav-brand"]') as HTMLElement;
      const brandLink = brand.querySelector("a") as HTMLElement;
      const content = navbar.querySelector('[data-slot="navbar-content"]') as HTMLElement;
      const toggle = navbar.querySelector('[data-slot="navbar-toggle"]') as HTMLElement;
      const contentStyle = getComputedStyle(content);

      return {
        collapseAt: navbar.getAttribute("data-collapse-at"),
        toggleDisplay: getComputedStyle(toggle).display,
        contentDisplay: contentStyle.display,
        contentFlexDirection: contentStyle.flexDirection,
        brandLinkHeight: brandLink.getBoundingClientRect().height,
        brandLinkTextDecorationLine: getComputedStyle(brandLink).textDecorationLine,
        contentScrollWidth: content.scrollWidth,
        navbarClientWidth: navbar.clientWidth,
      };
    });

    expect(measured.collapseAt).toBe("md");
    expect(measured.toggleDisplay).not.toBe("none");
    expect(measured.contentDisplay).toBe("flex");
    expect(measured.contentFlexDirection).toBe("column");
    expect(measured.brandLinkHeight).toBeGreaterThanOrEqual(36);
    expect(measured.brandLinkTextDecorationLine).toBe("none");
    expect(measured.contentScrollWidth).toBeLessThanOrEqual(measured.navbarClientWidth);
  });

  test("should keep table density readable inside the mobile audit width", async ({ page }) => {
    await openAudit(page, 320);

    const measured = await page.evaluate(() => {
      const table = document.querySelector(
        '#surfaces .preview[data-theme="light"] [data-slot="table"]',
      ) as HTMLElement;
      const headerCell = table.querySelector('[data-slot="table-header-cell"]') as HTMLElement;
      const bodyCell = table.querySelector('[data-slot="table-cell"]') as HTMLElement;
      const headerStyle = getComputedStyle(headerCell);
      const bodyStyle = getComputedStyle(bodyCell);

      return {
        tableLayout: getComputedStyle(table).tableLayout,
        headerWhiteSpace: headerStyle.whiteSpace,
        bodyWhiteSpace: bodyStyle.whiteSpace,
        headerVerticalAlign: headerStyle.verticalAlign,
        bodyVerticalAlign: bodyStyle.verticalAlign,
        headerPaddingInlineStart: Number.parseFloat(
          headerStyle.paddingInlineStart.replace("px", ""),
        ),
        headerLetterSpacing: headerStyle.letterSpacing,
      };
    });

    expect(measured.tableLayout).toBe("auto");
    expect(measured.headerWhiteSpace).toBe("normal");
    expect(measured.bodyWhiteSpace).toBe("normal");
    expect(measured.headerVerticalAlign).toBe("middle");
    expect(measured.bodyVerticalAlign).toBe("middle");
    expect(measured.headerPaddingInlineStart).toBeLessThanOrEqual(8);
    expect(measured.headerLetterSpacing).toBe("normal");
  });

  test("should render a complete, labeled form audit with input and textarea states", async ({
    page,
  }) => {
    await openAudit(page, 1440);

    const measured = await page.evaluate(() => {
      const form = document.querySelector('[data-slot="form"]') as HTMLFormElement | null;
      if (!form) return { formTagName: null, fields: null };

      return {
        formTagName: form.tagName,
        fields: [...form.querySelectorAll('[data-slot="field"]')].map((field) => {
          const label = field.querySelector('[data-slot="label"]') as HTMLElement | null;
          const control = field.querySelector(
            '[data-slot="input"], [data-slot="textarea"]',
          ) as HTMLElement | null;
          return {
            html: field.outerHTML,
            hasLabel: label !== null,
            labelText: label?.textContent?.trim() ?? null,
            hasControl: control !== null,
            controlWidth: control?.getBoundingClientRect().width ?? null,
          };
        }),
      };
    });

    expect(
      measured.formTagName,
      'visual-check.html is missing a rendered [data-slot="form"]',
    ).not.toBeNull();
    expect(measured.formTagName).toBe("FORM");

    const fields = measured.fields!;
    expect(fields.length).toBeGreaterThanOrEqual(5);

    for (const field of fields) {
      await test.step(field.html, () => {
        expect(field.hasLabel).toBe(true);
        expect(field.labelText).not.toBe("");
        expect(field.hasControl).toBe(true);
        expect(field.controlWidth).toBeGreaterThan(0);
      });
    }
  });

  test("should stack structured menu labels and descriptions across standalone and modal contexts", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    for (const width of [320, 768, 1440]) {
      await openAudit(page, width);

      for (const direction of ["ltr", "rtl"] as const) {
        await setDirection(page, direction);

        for (const caseName of ["standalone", "constrained", "modal"]) {
          const measured = await page.evaluate(
            ([name, dir]) => {
              const container = document.querySelector(
                `[data-audit-menu-case="${name}"]`,
              ) as HTMLElement;
              const menuSurface = container.querySelector(
                ':scope > [data-slot="menu-content"]',
              ) as HTMLElement;
              const items = [
                ...menuSurface.querySelectorAll('[data-slot="menu-item"]'),
              ] as HTMLElement[];
              const menubar = container.querySelector(
                ':scope > [data-slot="menubar-content"]',
              ) as HTMLElement | null;

              return {
                itemCount: items.length,
                hasMenubar: menubar !== null,
                menubarItemCount: menubar
                  ? menubar.querySelectorAll('[data-slot="menu-item"]').length
                  : null,
                containerScrollWidth: container.scrollWidth,
                containerClientWidth: container.clientWidth,
                overflowingItems: items
                  .filter((item) => item.scrollWidth > item.clientWidth)
                  .map((item) => item.outerHTML),
                described: items
                  .filter((item) => item.querySelector('[data-slot="menu-item-description"]'))
                  .map((item) => {
                    const icon = item.querySelector(
                      '[data-slot="menu-item-icon"]',
                    ) as HTMLElement | null;
                    const label = item.querySelector(
                      '[data-slot="menu-item-label"]',
                    ) as HTMLElement;
                    const description = item.querySelector(
                      '[data-slot="menu-item-description"]',
                    ) as HTMLElement;
                    const labelBounds = label.getBoundingClientRect();
                    const descriptionBounds = description.getBoundingClientRect();
                    const iconBounds = icon?.getBoundingClientRect() ?? null;

                    return {
                      html: item.outerHTML,
                      labelLeft: labelBounds.left,
                      labelRight: labelBounds.right,
                      labelBottom: labelBounds.bottom,
                      descriptionLeft: descriptionBounds.left,
                      descriptionTop: descriptionBounds.top,
                      iconEdge: iconBounds
                        ? dir === "ltr"
                          ? iconBounds.right
                          : iconBounds.left
                        : null,
                    };
                  }),
              };
            },
            [caseName, direction] as const,
          );

          await test.step(`${direction} ${caseName} at ${width}px`, () => {
            expect(measured.itemCount, `${direction} ${caseName} item count at ${width}px`).toBe(4);
            if (caseName === "modal") {
              expect(measured.hasMenubar, `${direction} modal menubar at ${width}px`).toBe(true);
              expect(measured.menubarItemCount).toBe(4);
            }
            expect(
              measured.containerScrollWidth,
              `${direction} ${caseName} overflow at ${width}px`,
            ).toBeLessThanOrEqual(measured.containerClientWidth);
            expect(measured.overflowingItems).toEqual([]);
          });

          for (const item of measured.described) {
            await test.step(item.html, () => {
              expect(item.descriptionLeft).toBeCloseTo(item.labelLeft, 0);
              expect(item.descriptionTop + 0.5).toBeGreaterThanOrEqual(item.labelBottom);
              if (item.iconEdge !== null) {
                if (direction === "ltr") expect(item.iconEdge).toBeLessThanOrEqual(item.labelLeft);
                else expect(item.iconEdge).toBeGreaterThanOrEqual(item.labelRight);
              }
            });
          }
        }
      }
    }
  });

  test("should keep oversized block presets inside narrow containers", async ({ markup, root }) => {
    await markup(`
      <div style="width: 320px; overflow: auto;">
        <div data-slot="block">
          <article class="card" data-slot="card">One</article>
          <article class="card" data-slot="card">Two</article>
        </div>
      </div>
    `);

    const measured = await root.evaluate((container) => {
      const wrapper = container.firstElementChild as HTMLElement;
      const block = wrapper.querySelector('[data-slot="block"]') as HTMLElement;
      return {
        wrapperClientWidth: wrapper.clientWidth,
        blockScrollWidth: block.scrollWidth,
        gridTemplateColumns: getComputedStyle(block).gridTemplateColumns,
      };
    });

    expect(measured.blockScrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
    expect(measured.gridTemplateColumns).not.toContain("480px");
  });

  test("should keep mobile overlays and horizontal groups within a 320px surface", async ({
    markup,
    root,
  }) => {
    await markup(`
      <div style="width: 320px; overflow: auto;">
        <section data-slot="dialog-content">
          <h2 data-slot="dialog-title">A very long mobile dialog title that wraps</h2>
          <p data-slot="dialog-description">Readable copy.</p>
        </section>
        <button data-slot="popover-trigger" data-variant="ghost" data-size="icon-xs">
          i
        </button>
        <section data-slot="popover-content" data-width="md">
          Popover content with a long wrapping sentence.
        </section>
        <div data-slot="dropdown-content">
          <button data-slot="dropdown-item">Account settings with a very long label</button>
        </div>
        <div data-slot="select-content">
          <button data-slot="select-item">Production environment with a very long target</button>
        </div>
        <div data-slot="toast"><p data-slot="toast-description">Toast copy wraps.</p></div>
        <nav class="pills" data-slot="pills" aria-label="Reports">
          <a class="pill" data-slot="pill" href="#">Daily digest</a>
          <a class="pill" data-slot="pill" href="#">Weekly operational review</a>
          <a class="pill" data-slot="pill" href="#">Monthly executive summary</a>
        </nav>
        <nav class="tabs" data-slot="tabs" aria-label="Sections">
          <a class="tab" data-slot="tab" href="#">Overview</a>
          <a class="tab" data-slot="tab" href="#">Detailed operations</a>
        </nav>
      </div>
    `);

    const measured = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const wrapper = container.firstElementChild as HTMLElement;
      const checked = [
        '[data-slot="dialog-content"]',
        '[data-slot="popover-trigger"]',
        '[data-slot="popover-content"]',
        '[data-slot="dropdown-content"]',
        '[data-slot="select-content"]',
        '[data-slot="toast"]',
        '[data-slot="pills"]',
        '[data-slot="tabs"]',
      ];
      const popoverTrigger = wrapper.querySelector('[data-slot="popover-trigger"]') as HTMLElement;
      const popoverContent = wrapper.querySelector('[data-slot="popover-content"]') as HTMLElement;

      return {
        wrapperClientWidth: wrapper.clientWidth,
        widths: checked.map((selector) => ({
          selector,
          scrollWidth: (wrapper.querySelector(selector) as HTMLElement).scrollWidth,
        })),
        popoverTriggerMinHeight: px(getComputedStyle(popoverTrigger).minHeight),
        popoverContentWidth: px(getComputedStyle(popoverContent).width),
      };
    });

    for (const element of measured.widths) {
      await test.step(element.selector, () => {
        expect(element.scrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
      });
    }

    expect(measured.popoverTriggerMinHeight).toBeGreaterThanOrEqual(24);
    expect(measured.popoverContentWidth).toBeGreaterThan(220);
  });

  test("should keep overlay motion states stable and non-interactive while closing", async ({
    markup,
    root,
  }) => {
    await markup(`
      <div style="width: 320px; overflow: auto;">
        <div data-slot="dialog-overlay" data-state="closed"></div>
        <section data-slot="dialog-content" data-state="closed">
          <h2 data-slot="dialog-title">Closing dialog</h2>
        </section>
        <section data-slot="popover-content" data-state="closed">Popover</section>
        <div data-slot="dropdown-content" data-state="closed">
          <button data-slot="dropdown-item">Dropdown item</button>
        </div>
        <div data-slot="select-content" data-state="closed">
          <button data-slot="select-item">Select item</button>
        </div>
        <div data-slot="tooltip-content" data-state="closed" data-side="top">
          Tooltip with a long wrapping label
        </div>
        <div data-slot="toast" data-state="closed">
          <strong data-slot="toast-title">Toast</strong>
          <p data-slot="toast-description">Toast copy</p>
        </div>
      </div>
    `);

    const measured = await root.evaluate((container) => {
      const wrapper = container.firstElementChild as HTMLElement;
      const selectors = [
        '[data-slot="dialog-overlay"]',
        '[data-slot="dialog-content"]',
        '[data-slot="popover-content"]',
        '[data-slot="dropdown-content"]',
        '[data-slot="select-content"]',
        '[data-slot="tooltip-content"]',
        '[data-slot="toast"]',
      ];

      return {
        wrapperClientWidth: wrapper.clientWidth,
        surfaces: selectors.map((selector) => {
          const element = wrapper.querySelector(selector) as HTMLElement;
          const style = getComputedStyle(element);
          return {
            selector,
            animationName: style.animationName,
            pointerEvents: style.pointerEvents,
            scrollWidth: element.scrollWidth,
          };
        }),
        dialogTransformOrigin: getComputedStyle(
          wrapper.querySelector('[data-slot="dialog-content"]') as HTMLElement,
        ).transformOrigin,
        tooltipOverflowWrap: getComputedStyle(
          wrapper.querySelector('[data-slot="tooltip-content"]') as HTMLElement,
        ).overflowWrap,
      };
    });

    const expectations = new Map([
      ['[data-slot="dialog-overlay"]', "ak-fade-out"],
      ['[data-slot="dialog-content"]', "ak-scale-out"],
      ['[data-slot="popover-content"]', "ak-slide-up-out"],
      ['[data-slot="dropdown-content"]', "ak-menu-out"],
      ['[data-slot="select-content"]', "ak-select-out"],
      ['[data-slot="tooltip-content"]', "ak-tooltip-out"],
      ['[data-slot="toast"]', "ak-toast-out"],
    ]);

    for (const surface of measured.surfaces) {
      await test.step(surface.selector, () => {
        expect(surface.animationName).toBe(expectations.get(surface.selector));
        expect(surface.pointerEvents).toBe("none");
        if (surface.selector !== '[data-slot="dialog-overlay"]') {
          expect(surface.scrollWidth).toBeLessThanOrEqual(measured.wrapperClientWidth);
        }
      });
    }

    expect(measured.dialogTransformOrigin).not.toBe("0px 0px");
    expect(measured.tooltipOverflowWrap).toBe("anywhere");
  });

  test("should keep semantic navigation slots compact and contained", async ({ markup, root }) => {
    await markup(`
      <nav data-slot="navbar">
        <div data-slot="nav-group">
          <div data-slot="nav-group-label">Workspace</div>
          <div data-slot="nav-group-body">
            <a data-slot="nav-item" data-active="true" href="#">
              Very long active workspace navigation label
            </a>
          </div>
        </div>
      </nav>
      <aside data-slot="sidebar">
        <a data-slot="nav-item" href="#">Settings and administration controls</a>
      </aside>
    `);

    const measured = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const items = [
        '[data-slot="navbar"] [data-slot="nav-item"]',
        '[data-slot="sidebar"] [data-slot="nav-item"]',
      ].map((selector) => {
        const item = container.querySelector(selector) as HTMLElement;
        const style = getComputedStyle(item);
        return {
          selector,
          scrollWidth: item.scrollWidth,
          minHeight: px(style.minHeight),
          paddingInlineStart: px(style.paddingInlineStart),
          overflowWrap: style.overflowWrap,
        };
      });

      const active = container.querySelector(
        '[data-slot="nav-item"][data-active="true"]',
      ) as HTMLElement;

      return {
        innerWidth: window.innerWidth,
        items,
        activeBackground: getComputedStyle(active).backgroundColor,
      };
    });

    for (const item of measured.items) {
      await test.step(item.selector, () => {
        expect(item.scrollWidth).toBeLessThanOrEqual(measured.innerWidth);
        expect(item.minHeight).toBeGreaterThan(0);
        expect(item.paddingInlineStart).toBeGreaterThan(0);
        expect(item.overflowWrap).toBe("anywhere");
      });
    }

    expect(measured.activeBackground).not.toBe(TRANSPARENT);
  });

  test("should keep page header and toolbar action rows wrap-safe", async ({ markup, root }) => {
    await markup(`
      <header data-slot="page-header">
        <div data-slot="page-header-copy">
          <h1 data-slot="page-header-title">Long page header title for operations</h1>
          <p data-slot="page-header-description">Description copy stays muted and readable.</p>
        </div>
        <div data-slot="page-header-actions">
          <button class="btn" data-slot="button">Filter</button>
          <button class="btn btn-primary" data-slot="button">Create</button>
        </div>
      </header>
      <div data-slot="toolbar">
        <h2 data-slot="toolbar-title">Projects</h2>
        <div data-slot="toolbar-actions">
          <button class="btn" data-slot="button">Export</button>
          <button class="btn btn-primary" data-slot="button">New project</button>
        </div>
      </div>
    `);

    const measured = await root.evaluate((container) => ({
      actions: ['[data-slot="page-header-actions"]', '[data-slot="toolbar-actions"]'].map(
        (selector) => ({
          selector,
          flexWrap: getComputedStyle(container.querySelector(selector) as HTMLElement).flexWrap,
        }),
      ),
      pageHeaderTitleMarginTop: getComputedStyle(
        container.querySelector('[data-slot="page-header-title"]') as HTMLElement,
      ).marginTop,
      toolbarTitleMarginTop: getComputedStyle(
        container.querySelector('[data-slot="toolbar-title"]') as HTMLElement,
      ).marginTop,
    }));

    for (const actions of measured.actions) {
      await test.step(actions.selector, () => {
        expect(actions.flexWrap).toBe("wrap");
      });
    }

    expect(measured.pageHeaderTitleMarginTop).toBe("0px");
    expect(measured.toolbarTitleMarginTop).toBe("0px");
  });
});
