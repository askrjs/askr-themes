import { afterEach, describe, expect, it } from "vite-plus/test";

import "../../src/themes/default/index.css";

function px(value: string): number {
  return Number.parseFloat(value.replace("px", ""));
}

describe("visual polish contracts", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.body.innerHTML = "";
  });

  it("keeps core interactive controls on one shared density rhythm", () => {
    document.body.innerHTML = `
      <button class="btn" data-slot="button">Save</button>
      <input class="input" data-slot="input" value="hello" />
      <button class="select-trigger" data-slot="select-trigger">
        <span data-slot="select-value">Production</span>
      </button>
      <button data-slot="toggle">Toggle</button>
      <button data-slot="dropdown-trigger">Dropdown</button>
      <button data-slot="menubar-trigger">File</button>
    `;

    const controls = [...document.body.children] as HTMLElement[];
    const heights = controls.map((control) => px(getComputedStyle(control).minHeight));

    expect(new Set(heights)).toEqual(new Set([38]));

    for (const control of controls) {
      const style = getComputedStyle(control);
      expect(px(style.paddingInlineStart), control.outerHTML).toBeGreaterThanOrEqual(12);
      expect(px(style.borderRadius), control.outerHTML).toBeGreaterThanOrEqual(6);
      expect(style.fontSize, control.outerHTML).toBe("14px");
    }
  });

  it("keeps menu-like rows aligned and compact", () => {
    document.body.innerHTML = `
      <div data-slot="dropdown-content">
        <button data-slot="dropdown-item">Profile</button>
      </div>
      <div data-slot="menu-content">
        <button data-slot="menu-item">Settings</button>
      </div>
      <div data-slot="menubar-content">
        <button data-slot="menubar-item">Export</button>
      </div>
      <div data-slot="select-content">
        <button data-slot="select-item">Production</button>
      </div>
    `;

    const rows = [
      document.querySelector('[data-slot="dropdown-item"]'),
      document.querySelector('[data-slot="menu-item"]'),
      document.querySelector('[data-slot="menubar-item"]'),
      document.querySelector('[data-slot="select-item"]'),
    ] as HTMLElement[];

    for (const row of rows) {
      const style = getComputedStyle(row);
      expect(px(style.minHeight), row.outerHTML).toBe(38);
      expect(px(style.paddingInlineStart), row.outerHTML).toBeGreaterThanOrEqual(14);
      expect(style.alignItems, row.outerHTML).toBe("center");
    }
  });

  it("keeps dark overlay surfaces dark, elevated, and readable", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.innerHTML = `
      <section data-slot="dialog-content">
        <h2 data-slot="dialog-title">Dialog</h2>
        <p data-slot="dialog-description">Readable copy.</p>
      </section>
      <section data-slot="popover-content">Popover</section>
      <div data-slot="tooltip-content">Tooltip</div>
      <div data-slot="toast"><strong data-slot="toast-title">Toast</strong></div>
    `;

    for (const selector of [
      '[data-slot="dialog-content"]',
      '[data-slot="popover-content"]',
      '[data-slot="tooltip-content"]',
      '[data-slot="toast"]',
    ]) {
      const element = document.querySelector(selector) as HTMLElement;
      const style = getComputedStyle(element);

      expect(style.backgroundColor, selector).not.toBe("rgba(0, 0, 0, 0)");
      expect(style.backgroundColor, selector).not.toBe("rgb(255, 255, 255)");
      expect(style.boxShadow, selector).not.toBe("none");
      expect(px(style.borderTopLeftRadius), selector).toBeGreaterThanOrEqual(8);
    }
  });

  it("protects dense surfaces from collapsed spacing and long-label overflow", () => {
    document.body.innerHTML = `
      <article class="card" data-slot="card">
        <h3 class="card-title" data-slot="card-title">A long card title that needs polish</h3>
        <p class="card-description" data-slot="card-description">
          Supporting copy should fit without losing rhythm.
        </p>
      </article>
      <ul class="list-group" data-slot="list-group">
        <li class="list-group-item" data-slot="list-group-item">
          A long enterprise label that should not collapse row spacing or alignment
        </li>
      </ul>
      <table data-slot="table">
        <tbody data-slot="table-body">
          <tr data-slot="table-row"><td data-slot="table-cell">Cell</td></tr>
        </tbody>
      </table>
    `;

    const card = document.querySelector('[data-slot="card"]') as HTMLElement;
    const listItem = document.querySelector('[data-slot="list-group-item"]') as HTMLElement;
    const tableCell = document.querySelector('[data-slot="table-cell"]') as HTMLElement;

    expect(px(getComputedStyle(card).gap)).toBeGreaterThanOrEqual(12);
    expect(px(getComputedStyle(listItem).minHeight)).toBeGreaterThanOrEqual(42);
    expect(px(getComputedStyle(tableCell).paddingBlockStart)).toBeGreaterThanOrEqual(10);
    expect(px(getComputedStyle(tableCell).paddingInlineStart)).toBeGreaterThanOrEqual(12);
  });
});
