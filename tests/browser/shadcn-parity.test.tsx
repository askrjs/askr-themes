import { afterEach, describe, expect, it } from "vite-plus/test";

import { SHADCN_NEW_YORK_V4_COMPUTED } from "../fixtures/shadcn-new-york-v4";
import "../../src/themes/default/index.css";

function px(value: string): number {
  return Number.parseFloat(value.replace("px", ""));
}

function expectNotTransparent(value: string, label: string): void {
  expect(value, label).not.toBe("rgba(0, 0, 0, 0)");
}

describe("shadcn New York visual parity", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.body.innerHTML = "";
  });

  it("should keep shared primitive computed styles aligned with shadcn defaults", () => {
    document.body.innerHTML = `
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
    `;

    const button = document.querySelector('[data-slot="button"]') as HTMLElement;
    const input = document.querySelector('[data-slot="input"]') as HTMLElement;
    const card = document.querySelector('[data-slot="card"]') as HTMLElement;
    const dialog = document.querySelector('[data-slot="dialog-content"]') as HTMLElement;
    const dropdownItem = document.querySelector('[data-slot="dropdown-item"]') as HTMLElement;
    const selectItem = document.querySelector('[data-slot="select-item"]') as HTMLElement;
    const tabsTrigger = document.querySelector('[data-slot="tabs-trigger"]') as HTMLElement;
    const tooltip = document.querySelector('[data-slot="tooltip-content"]') as HTMLElement;

    expect(px(getComputedStyle(button).minHeight)).toBe(SHADCN_NEW_YORK_V4_COMPUTED.buttonHeight);
    expect(getComputedStyle(button).fontSize).toBe(SHADCN_NEW_YORK_V4_COMPUTED.controlFontSize);
    expect(px(getComputedStyle(input).minHeight)).toBe(SHADCN_NEW_YORK_V4_COMPUTED.inputHeight);
    expect(getComputedStyle(input).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(px(getComputedStyle(card).borderTopLeftRadius)).toBe(
      SHADCN_NEW_YORK_V4_COMPUTED.cardRadius,
    );
    expect(getComputedStyle(dialog).boxShadow).not.toBe("none");
    expect(px(getComputedStyle(dropdownItem).minHeight)).toBe(
      SHADCN_NEW_YORK_V4_COMPUTED.menuRowHeight,
    );
    expect(px(getComputedStyle(selectItem).minHeight)).toBe(
      SHADCN_NEW_YORK_V4_COMPUTED.menuRowHeight,
    );
    expect(px(getComputedStyle(tabsTrigger).minHeight)).toBe(
      SHADCN_NEW_YORK_V4_COMPUTED.tabsTriggerHeight,
    );
    expect(getComputedStyle(tooltip).fontSize).toBe("12px");
  });

  it("should deepen sheet and sidebar anatomy with shadcn-like computed styles", () => {
    document.body.innerHTML = `
      <section data-slot="sheet-content" data-side="right">
        <header data-slot="sheet-header">
          <h2 data-slot="sheet-title">Settings</h2>
          <p data-slot="sheet-description">Workspace preferences.</p>
        </header>
      </section>
      <div data-slot="sidebar-provider">
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
    `;

    const sheet = document.querySelector('[data-slot="sheet-content"]') as HTMLElement;
    const provider = document.querySelector('[data-slot="sidebar-provider"]') as HTMLElement;
    const sidebar = document.querySelector('[data-slot="sidebar"]') as HTMLElement;
    const button = document.querySelector('[data-slot="sidebar-menu-button"]') as HTMLElement;
    const label = document.querySelector('[data-slot="sidebar-group-label"]') as HTMLElement;

    expect(getComputedStyle(sheet).position).toBe("fixed");
    expect(px(getComputedStyle(sheet).width)).toBe(SHADCN_NEW_YORK_V4_COMPUTED.sheetWidth);
    expect(getComputedStyle(provider).display).toBe("flex");
    expect(getComputedStyle(sidebar).display).toBe("flex");
    expect(px(getComputedStyle(button).minHeight)).toBe(
      SHADCN_NEW_YORK_V4_COMPUTED.sidebarMenuButtonHeight,
    );
    expectNotTransparent(getComputedStyle(button).backgroundColor, "active sidebar menu button");
    expect(getComputedStyle(label).fontSize).toBe("12px");
  });

  it("should deepen command, calendar, and item states to shadcn-like surfaces", () => {
    document.body.innerHTML = `
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
    `;

    const command = document.querySelector('[data-slot="command-dialog"]') as HTMLElement;
    const commandHeading = document.querySelector(
      '[data-slot="command-group-heading"]',
    ) as HTMLElement;
    const commandSelected = document.querySelector(
      '[data-slot="command-item"][data-selected="true"]',
    ) as HTMLElement;
    const commandDisabled = document.querySelector(
      "[data-slot='command-item'][data-disabled]",
    ) as HTMLElement;
    const calendarDay = document.querySelector(
      '[data-slot="calendar-day"][data-selected="true"]',
    ) as HTMLElement;
    const disabledDay = document.querySelector(
      "[data-slot='calendar-day'][data-disabled]",
    ) as HTMLElement;
    const item = document.querySelector('[data-slot="item"]') as HTMLElement;

    expect(getComputedStyle(command).boxShadow).not.toBe("none");
    expect(getComputedStyle(commandHeading).fontSize).toBe("12px");
    expect(px(getComputedStyle(commandSelected).minHeight)).toBe(
      SHADCN_NEW_YORK_V4_COMPUTED.commandRowHeight,
    );
    expectNotTransparent(
      getComputedStyle(commandSelected).backgroundColor,
      "selected command item",
    );
    expect(getComputedStyle(commandDisabled).opacity).toBe(
      SHADCN_NEW_YORK_V4_COMPUTED.disabledOpacity,
    );
    expect(px(getComputedStyle(calendarDay).minHeight)).toBe(
      SHADCN_NEW_YORK_V4_COMPUTED.calendarDaySize,
    );
    expectNotTransparent(getComputedStyle(calendarDay).backgroundColor, "selected calendar day");
    expect(getComputedStyle(disabledDay).opacity).toBe(SHADCN_NEW_YORK_V4_COMPUTED.disabledOpacity);
    expect(px(getComputedStyle(item).paddingBlockStart)).toBe(
      SHADCN_NEW_YORK_V4_COMPUTED.itemXsPaddingBlock,
    );
    expectNotTransparent(getComputedStyle(item).backgroundColor, "active item");
  });
});
