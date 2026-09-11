import { DEFAULT_VISUAL_BASELINE } from "../fixtures/default-visual-baseline";
import { expect, test } from "./fixtures";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

test.describe("default theme visual baseline", () => {
  test("should keep shared primitive computed styles aligned with the default baseline", async ({
    markup,
    root,
  }) => {
    await markup(`
      <button data-slot="button">Save</button>
      <input data-slot="input" value="workspace" />
      <article data-slot="card">
        <header data-slot="card-header">
          <h3 data-slot="card-title">Usage</h3>
          <p data-slot="card-description">Last 30 days</p>
        </header>
      </article>
      <section data-slot="dialog-content">
        <h2 data-slot="dialog-title">Dialog</h2>
      </section>
      <div data-slot="dropdown-content">
        <button data-slot="dropdown-item">Profile</button>
      </div>
      <div data-slot="select-content">
        <button data-slot="select-item">Production</button>
      </div>
      <div data-slot="tabs-list">
        <button data-slot="tabs-trigger" data-state="active">Preview</button>
      </div>
      <div data-slot="tooltip-content">Tooltip</div>
    `);

    const styles = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const read = (selector: string): CSSStyleDeclaration =>
        getComputedStyle(container.querySelector(selector) as HTMLElement);

      const button = read('[data-slot="button"]');
      const input = read('[data-slot="input"]');
      const card = read('[data-slot="card"]');
      const dialog = read('[data-slot="dialog-content"]');
      const dropdownItem = read('[data-slot="dropdown-item"]');
      const selectItem = read('[data-slot="select-item"]');
      const tabsTrigger = read('[data-slot="tabs-trigger"]');
      const tooltip = read('[data-slot="tooltip-content"]');

      return {
        buttonMinHeight: px(button.minHeight),
        buttonFontSize: button.fontSize,
        inputMinHeight: px(input.minHeight),
        inputBackgroundColor: input.backgroundColor,
        cardBorderTopLeftRadius: px(card.borderTopLeftRadius),
        dialogBoxShadow: dialog.boxShadow,
        dropdownItemMinHeight: px(dropdownItem.minHeight),
        selectItemMinHeight: px(selectItem.minHeight),
        tabsTriggerMinHeight: px(tabsTrigger.minHeight),
        tooltipFontSize: tooltip.fontSize,
      };
    });

    expect(styles.buttonMinHeight).toBe(DEFAULT_VISUAL_BASELINE.buttonHeight);
    expect(styles.buttonFontSize).toBe(DEFAULT_VISUAL_BASELINE.controlFontSize);
    expect(styles.inputMinHeight).toBe(DEFAULT_VISUAL_BASELINE.inputHeight);
    expect(styles.inputBackgroundColor).toBe(TRANSPARENT);
    expect(styles.cardBorderTopLeftRadius).toBe(DEFAULT_VISUAL_BASELINE.cardRadius);
    expect(styles.dialogBoxShadow).not.toBe("none");
    expect(styles.dropdownItemMinHeight).toBe(DEFAULT_VISUAL_BASELINE.menuRowHeight);
    expect(styles.selectItemMinHeight).toBe(DEFAULT_VISUAL_BASELINE.menuRowHeight);
    expect(styles.tabsTriggerMinHeight).toBe(DEFAULT_VISUAL_BASELINE.tabsTriggerHeight);
    expect(styles.tooltipFontSize).toBe("12px");
  });

  test("should deepen sheet and sidebar anatomy with default theme computed styles", async ({
    markup,
    root,
  }) => {
    await markup(`
      <section data-slot="sheet-content" data-side="right">
        <header data-slot="sheet-header">
          <h2 data-slot="sheet-title">Settings</h2>
          <p data-slot="sheet-description">Workspace preferences.</p>
        </header>
      </section>
      <div data-slot="sidebar-scope">
        <aside data-slot="sidebar" data-side="left" data-variant="sidebar" data-collapsible="offcanvas">
          <div data-slot="sidebar-header">Workspace</div>
          <div data-slot="sidebar-content">
            <div data-slot="sidebar-group">
              <div data-slot="sidebar-group-label">Platform</div>
              <ul data-slot="sidebar-menu">
                <li data-slot="sidebar-menu-item">
                  <button data-slot="sidebar-menu-button" data-active="true">Dashboard</button>
                  <span data-slot="sidebar-menu-badge">3</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
        <main data-slot="sidebar-inset">Content</main>
      </div>
    `);

    const styles = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const read = (selector: string): CSSStyleDeclaration =>
        getComputedStyle(container.querySelector(selector) as HTMLElement);

      const sheet = read('[data-slot="sheet-content"]');
      const scope = read('[data-slot="sidebar-scope"]');
      const sidebar = read('[data-slot="sidebar"]');
      const button = read('[data-slot="sidebar-menu-button"]');
      const label = read('[data-slot="sidebar-group-label"]');

      return {
        sheetPosition: sheet.position,
        sheetWidth: px(sheet.width),
        scopeDisplay: scope.display,
        sidebarDisplay: sidebar.display,
        buttonMinHeight: px(button.minHeight),
        buttonBackgroundColor: button.backgroundColor,
        labelFontSize: label.fontSize,
      };
    });

    expect(styles.sheetPosition).toBe("fixed");
    expect(styles.sheetWidth).toBe(DEFAULT_VISUAL_BASELINE.sheetWidth);
    expect(styles.scopeDisplay).toBe("flex");
    expect(styles.sidebarDisplay).toBe("flex");
    expect(styles.buttonMinHeight).toBe(DEFAULT_VISUAL_BASELINE.sidebarMenuButtonHeight);
    expect({
      label: "active sidebar menu button",
      backgroundColor: styles.buttonBackgroundColor,
    }).not.toEqual({ label: "active sidebar menu button", backgroundColor: TRANSPARENT });
    expect(styles.labelFontSize).toBe("12px");
  });

  test("should deepen command, calendar, and item states to default theme surfaces", async ({
    markup,
    root,
  }) => {
    await markup(`
      <div data-slot="command-dialog">
        <div data-slot="command-header">
          <input data-slot="command-input" value="search" />
        </div>
        <div data-slot="command-list">
          <div data-slot="command-group">
            <div data-slot="command-group-heading">Suggestions</div>
            <div data-slot="command-item" data-selected="true">Calendar</div>
            <div data-slot="command-item" data-disabled>Disabled</div>
          </div>
        </div>
      </div>
      <div data-slot="calendar">
        <div data-slot="calendar-header">
          <button data-slot="calendar-previous">Prev</button>
          <div data-slot="calendar-caption">June 2026</div>
          <button data-slot="calendar-next">Next</button>
        </div>
        <button data-slot="calendar-day" data-selected="true">26</button>
        <button data-slot="calendar-day" data-disabled>27</button>
      </div>
      <div data-slot="item-group">
        <div data-slot="item" data-variant="outline" data-size="xs" data-active="true">
          <div data-slot="item-media">i</div>
          <div data-slot="item-content">
            <div data-slot="item-title">Profile</div>
            <div data-slot="item-description">Verified</div>
          </div>
          <div data-slot="item-actions">Open</div>
        </div>
      </div>
    `);

    const styles = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const read = (selector: string): CSSStyleDeclaration =>
        getComputedStyle(container.querySelector(selector) as HTMLElement);

      const command = read('[data-slot="command-dialog"]');
      const commandHeading = read('[data-slot="command-group-heading"]');
      const commandSelected = read('[data-slot="command-item"][data-selected="true"]');
      const commandDisabled = read("[data-slot='command-item'][data-disabled]");
      const calendarDay = read('[data-slot="calendar-day"][data-selected="true"]');
      const disabledDay = read("[data-slot='calendar-day'][data-disabled]");
      const item = read('[data-slot="item"]');

      return {
        commandBoxShadow: command.boxShadow,
        commandHeadingFontSize: commandHeading.fontSize,
        commandSelectedMinHeight: px(commandSelected.minHeight),
        commandSelectedBackgroundColor: commandSelected.backgroundColor,
        commandDisabledOpacity: commandDisabled.opacity,
        calendarDayMinHeight: px(calendarDay.minHeight),
        calendarDayBackgroundColor: calendarDay.backgroundColor,
        disabledDayOpacity: disabledDay.opacity,
        itemPaddingBlockStart: px(item.paddingBlockStart),
        itemBackgroundColor: item.backgroundColor,
      };
    });

    expect(styles.commandBoxShadow).not.toBe("none");
    expect(styles.commandHeadingFontSize).toBe("12px");
    expect(styles.commandSelectedMinHeight).toBe(DEFAULT_VISUAL_BASELINE.commandRowHeight);
    expect({
      label: "selected command item",
      backgroundColor: styles.commandSelectedBackgroundColor,
    }).not.toEqual({ label: "selected command item", backgroundColor: TRANSPARENT });
    expect(styles.commandDisabledOpacity).toBe(DEFAULT_VISUAL_BASELINE.disabledOpacity);
    expect(styles.calendarDayMinHeight).toBe(DEFAULT_VISUAL_BASELINE.calendarDaySize);
    expect({
      label: "selected calendar day",
      backgroundColor: styles.calendarDayBackgroundColor,
    }).not.toEqual({ label: "selected calendar day", backgroundColor: TRANSPARENT });
    expect(styles.disabledDayOpacity).toBe(DEFAULT_VISUAL_BASELINE.disabledOpacity);
    expect(styles.itemPaddingBlockStart).toBe(DEFAULT_VISUAL_BASELINE.itemXsPaddingBlock);
    expect({ label: "active item", backgroundColor: styles.itemBackgroundColor }).not.toEqual({
      label: "active item",
      backgroundColor: TRANSPARENT,
    });
  });
});
