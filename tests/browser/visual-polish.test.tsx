import { afterEach, describe, expect, it } from "vite-plus/test";

import "../../src/themes/default/index.css";

function px(value: string): number {
  return Number.parseFloat(value.replace("px", ""));
}

async function loadAuditFrame(width: number): Promise<HTMLIFrameElement> {
  const iframe = document.createElement("iframe");
  iframe.style.width = `${width}px`;
  iframe.style.height = "900px";
  iframe.style.border = "0";
  iframe.src = "/visual-check.html";
  document.body.appendChild(iframe);

  await new Promise<void>((resolve, reject) => {
    iframe.addEventListener("load", () => resolve(), { once: true });
    iframe.addEventListener("error", () => reject(new Error("audit frame failed to load")), {
      once: true,
    });
  });

  return iframe;
}

describe("visual polish contracts", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.body.innerHTML = "";
  });

  it("should keeps core interactive controls on one shared density rhythm", () => {
    document.body.innerHTML = `
      <button class="btn" data-slot="button">Save</button>
      <input class="input" data-slot="input" value="hello" />
      <button class="select-trigger" data-slot="select-trigger">
        <span data-slot="select-value">Production</span>
      </button>
      <button data-slot="dropdown-trigger">Dropdown</button>
    `;

    const controls = [...document.body.children] as HTMLElement[];
    const heights = controls.map((control) => px(getComputedStyle(control).minHeight));

    expect(new Set(heights)).toEqual(new Set([36]));

    for (const control of controls) {
      const style = getComputedStyle(control);
      expect(px(style.paddingInlineStart), control.outerHTML).toBeGreaterThanOrEqual(12);
      expect(px(style.borderRadius), control.outerHTML).toBeGreaterThanOrEqual(6);
      expect(style.fontSize, control.outerHTML).toBe("14px");
    }
  });

  it("should keeps dropdown and select rows aligned and compact", () => {
    document.body.innerHTML = `
      <div data-slot="dropdown-content">
        <button data-slot="dropdown-item">Profile</button>
      </div>
      <div data-slot="select-content">
        <button data-slot="select-item">Production</button>
      </div>
    `;

    const rows = [
      document.querySelector('[data-slot="dropdown-item"]'),
      document.querySelector('[data-slot="select-item"]'),
    ] as HTMLElement[];

    for (const row of rows) {
      const style = getComputedStyle(row);
      expect(px(style.minHeight), row.outerHTML).toBe(32);
      expect(px(style.paddingInlineStart), row.outerHTML).toBeGreaterThanOrEqual(8);
      expect(style.alignItems, row.outerHTML).toBe("center");
    }
  });

  it("should reset select popup items so native button chrome does not leak through", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.innerHTML = `
      <div data-slot="select-content">
        <button data-slot="select-item" data-state="checked">Production</button>
        <button data-slot="select-item">Preview</button>
      </div>
    `;

    const selectItem = document.querySelector(
      '[data-slot="select-item"]:not([data-state="checked"])',
    ) as HTMLElement;
    const style = getComputedStyle(selectItem);

    expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(style.borderTopStyle).toBe("none");
    expect(px(style.borderTopWidth)).toBe(0);
    expect(style.textAlign).toBe("start");
  });

  it("should keeps dark overlay surfaces dark, elevated, and readable", () => {
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
      if (selector === '[data-slot="tooltip-content"]') {
        expect(style.boxShadow, selector).toBe("none");
      } else {
        expect(style.boxShadow, selector).not.toBe("none");
      }
      expect(px(style.borderTopLeftRadius), selector).toBeGreaterThanOrEqual(8);
    }
  });

  it("should protects dense surfaces from collapsed spacing and long-label overflow", () => {
    document.body.innerHTML = `
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
    `;

    const card = document.querySelector('[data-slot="card"]') as HTMLElement;
    const tableCell = document.querySelector('[data-slot="table-cell"]') as HTMLElement;
    const minTablePadding = window.matchMedia("(max-width: 30rem)").matches ? 4 : 10;
    const tableHeaders = [
      ...document.querySelectorAll('[data-slot="table-header-cell"]'),
    ] as HTMLElement[];

    expect(px(getComputedStyle(card).gap)).toBeGreaterThanOrEqual(12);
    expect(px(getComputedStyle(tableCell).paddingBlockStart)).toBeGreaterThanOrEqual(
      minTablePadding,
    );
    expect(px(getComputedStyle(tableCell).paddingInlineStart)).toBeGreaterThanOrEqual(
      minTablePadding,
    );

    for (const header of tableHeaders) {
      const expectedHeaderWrap = window.matchMedia("(max-width: 30rem)").matches
        ? "anywhere"
        : "normal";
      expect(getComputedStyle(header).overflowWrap, header.textContent ?? "").toBe(
        expectedHeaderWrap,
      );
      expect(header.scrollWidth, header.textContent ?? "").toBeLessThanOrEqual(header.clientWidth);
    }
  });

  it("should gives disclosure and scroll primitives usable default polish", () => {
    document.body.innerHTML = `
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
    `;

    const trigger = document.querySelector('[data-slot="accordion-trigger"]') as HTMLElement;
    const content = document.querySelector('[data-slot="accordion-content"]') as HTMLElement;
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;

    expect(getComputedStyle(trigger).display).toBe("flex");
    expect(px(getComputedStyle(trigger).minHeight)).toBeGreaterThanOrEqual(36);
    expect(getComputedStyle(content).color).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(viewport).overflowX).toBe("auto");
    expect(getComputedStyle(viewport).overflowY).toBe("auto");
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
  });

  it("should gives slider, toggles, hover cards, and menubars usable default polish", () => {
    document.body.innerHTML = `
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
    `;

    const wrapper = document.body.firstElementChild as HTMLElement;
    const slider = wrapper.querySelector('[data-slot="slider"]') as HTMLElement;
    const track = wrapper.querySelector('[data-slot="slider-track"]') as HTMLElement;
    const range = wrapper.querySelector('[data-slot="slider-range"]') as HTMLElement;
    const thumb = wrapper.querySelector('[data-slot="slider-thumb"]') as HTMLElement;
    const toggleGroup = wrapper.querySelector('[data-slot="toggle-group"]') as HTMLElement;
    const activeToggle = wrapper.querySelector(
      '[data-slot="toggle-group-item"][data-state="on"]',
    ) as HTMLElement;
    const standaloneToggle = wrapper.querySelector('[data-slot="toggle"]') as HTMLElement;
    const hoverTrigger = wrapper.querySelector('[data-slot="hover-card-trigger"]') as HTMLElement;
    const hoverContent = wrapper.querySelector('[data-slot="hover-card-content"]') as HTMLElement;
    const menubar = wrapper.querySelector('[data-slot="menubar"]') as HTMLElement;
    const menubarTrigger = wrapper.querySelector('[data-slot="menubar-trigger"]') as HTMLElement;
    const menubarContent = wrapper.querySelector('[data-slot="menubar-content"]') as HTMLElement;
    const menubarItem = wrapper.querySelector('[data-slot="menubar-item"]') as HTMLElement;
    const menubarSubTrigger = wrapper.querySelector(
      '[data-slot="menubar-sub-trigger"]',
    ) as HTMLElement;

    expect(slider.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth);
    expect(px(getComputedStyle(slider).minHeight)).toBe(36);
    expect(px(getComputedStyle(track).height)).toBe(8);
    expect(px(getComputedStyle(range).width)).toBeGreaterThan(0);
    expect(px(getComputedStyle(thumb).width)).toBeGreaterThanOrEqual(18);
    expect(px(getComputedStyle(thumb).height)).toBeGreaterThanOrEqual(18);

    expect(getComputedStyle(toggleGroup).display).toBe("inline-flex");
    expect(activeToggle.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth);
    expect(getComputedStyle(activeToggle).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(standaloneToggle).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

    expect(getComputedStyle(hoverTrigger).textDecorationLine).toBe("none");
    expect(getComputedStyle(hoverContent).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(hoverContent).boxShadow).not.toBe("none");
    expect(hoverContent.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth);

    expect(menubar.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth);
    expect(px(getComputedStyle(menubarTrigger).minHeight)).toBe(32);
    expect(getComputedStyle(menubarContent).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(menubarContent).boxShadow).not.toBe("none");
    expect(px(getComputedStyle(menubarItem).minHeight)).toBe(32);
    expect(getComputedStyle(menubarItem).textDecorationLine).toBe("none");
    expect(getComputedStyle(menubarSubTrigger).textDecorationLine).toBe("none");
  });

  it("should gives virtualized list and table surfaces stable default polish", () => {
    document.body.innerHTML = `
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
          <table data-slot="virtual-table-table">
            <thead data-slot="virtual-table-head">
              <tr data-slot="virtual-table-header-row">
                <th data-slot="virtual-table-header-cell">Time</th>
                <th data-slot="virtual-table-header-cell">Service</th>
                <th data-slot="virtual-table-header-cell">Message</th>
              </tr>
            </thead>
            <tbody data-slot="virtual-table-body">
              <tr data-slot="virtual-table-row" data-selected="true">
                <td data-slot="virtual-table-cell">09:17</td>
                <td data-slot="virtual-table-cell">router</td>
                <td data-slot="virtual-table-cell">Long route verification message</td>
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
    `;

    const wrapper = document.body.firstElementChild as HTMLElement;
    const list = wrapper.querySelector('[data-slot="virtual-list"]') as HTMLElement;
    const listRow = wrapper.querySelector('[data-slot="virtual-list-row"]') as HTMLElement;
    const table = wrapper.querySelector('[data-slot="virtual-table"]') as HTMLElement;
    const tableInner = wrapper.querySelector('[data-slot="virtual-table-table"]') as HTMLElement;
    const headerCell = wrapper.querySelector(
      '[data-slot="virtual-table-header-cell"]',
    ) as HTMLElement;
    const selectedRow = wrapper.querySelector(
      '[data-slot="virtual-table-row"][data-selected="true"]',
    ) as HTMLElement;
    const tableCell = wrapper.querySelector('[data-slot="virtual-table-cell"]') as HTMLElement;
    const monoText = wrapper.querySelector('[data-slot="text"][data-font="mono"]') as HTMLElement;
    const wrappedText = wrapper.querySelector(
      '[data-slot="text"][data-wrap="anywhere"]',
    ) as HTMLElement;

    expect(list.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth);
    expect(getComputedStyle(list).overflowY).toBe("auto");
    expect(px(getComputedStyle(list).height)).toBe(448);
    expect(getComputedStyle(list).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(listRow).display).toBe("flex");
    expect(px(getComputedStyle(listRow).borderBottomWidth)).toBeGreaterThanOrEqual(1);

    expect(table.scrollWidth).toBeGreaterThanOrEqual(wrapper.clientWidth);
    expect(getComputedStyle(table).overflowX).toBe("auto");
    expect(px(getComputedStyle(table).height)).toBe(448);
    expect(getComputedStyle(table).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(tableInner).borderCollapse).toBe("collapse");
    expect(px(getComputedStyle(tableInner).minWidth)).toBe(640);
    expect(getComputedStyle(headerCell).fontWeight).not.toBe("400");
    expect(getComputedStyle(selectedRow).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(tableCell).textOverflow).toBe("ellipsis");
    expect(getComputedStyle(monoText).fontVariantNumeric).toContain("tabular-nums");
    expect(getComputedStyle(monoText).textOverflow).toBe("ellipsis");
    expect(getComputedStyle(wrappedText).overflowWrap).toBe("anywhere");
  });

  it("should keeps supporting primitives compact, responsive, and aligned", () => {
    document.body.innerHTML = `
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
    `;

    const wrapper = document.body.firstElementChild as HTMLElement;
    const avatar = wrapper.querySelector('[data-slot="avatar"]') as HTMLElement;
    const avatarFallback = wrapper.querySelector('[data-slot="avatar-fallback"]') as HTMLElement;
    const progress = wrapper.querySelector('[data-slot="progress"]') as HTMLElement;
    const progressCircle = wrapper.querySelector('[data-slot="progress-circle"]') as HTMLElement;
    const skeleton = wrapper.querySelector('[data-slot="skeleton"]') as HTMLElement;
    const separator = wrapper.querySelector('[data-slot="separator"]') as HTMLElement;
    const buttonGroup = wrapper.querySelector('[data-slot="button-group"]') as HTMLElement;
    const label = wrapper.querySelector('[data-slot="label"]') as HTMLElement;
    const themePicker = wrapper.querySelector('[data-slot="theme-picker"]') as HTMLElement;

    expect(px(getComputedStyle(avatar).width)).toBe(40);
    expect(px(getComputedStyle(avatar).height)).toBe(40);
    expect(getComputedStyle(avatar).flexShrink).toBe("0");
    expect(getComputedStyle(avatarFallback).lineHeight).toBe("14px");
    expect(getComputedStyle(avatarFallback).overflow).toBe("hidden");
    expect(getComputedStyle(avatarFallback).textOverflow).toBe("ellipsis");
    expect(getComputedStyle(avatarFallback).whiteSpace).toBe("nowrap");
    expect(avatarFallback.scrollHeight).toBeLessThanOrEqual(avatarFallback.clientHeight);

    expect(px(getComputedStyle(progress).height)).toBe(8);
    expect(progress.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth);
    expect(getComputedStyle(progressCircle).flexShrink).toBe("0");

    expect(skeleton.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth);
    expect(getComputedStyle(skeleton).backgroundImage).toContain("linear-gradient");
    expect(px(getComputedStyle(separator).height)).toBe(1);

    expect(getComputedStyle(buttonGroup).flexWrap).toBe("nowrap");
    expect(buttonGroup.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth);
    expect(getComputedStyle(label).overflowWrap).toBe("anywhere");
    expect(themePicker.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth);
    expect(px(getComputedStyle(themePicker).minHeight)).toBe(36);
  });

  it("should keeps status, loading, and media primitives resilient under long content", () => {
    document.body.innerHTML = `
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
    `;

    const wrapper = document.body.firstElementChild as HTMLElement;
    const badge = wrapper.querySelector('[data-slot="badge"]') as HTMLElement;
    const badgeIcon = wrapper.querySelector(
      '[data-slot="badge"] [data-slot="icon"]',
    ) as HTMLElement;
    const alert = wrapper.querySelector('[data-slot="alert"]') as HTMLElement;
    const alertTitle = wrapper.querySelector('[data-slot="alert-title"]') as HTMLElement;
    const alertDescription = wrapper.querySelector(
      '[data-slot="alert-description"]',
    ) as HTMLElement;
    const emptyState = wrapper.querySelector('[data-slot="empty-state"]') as HTMLElement;
    const emptyActions = wrapper.querySelector('[data-slot="empty-state-actions"]') as HTMLElement;
    const aspectRatio = wrapper.querySelector('[data-slot="aspect-ratio"]') as HTMLElement;
    const spinner = wrapper.querySelector(
      '[data-slot="progress-circle"][data-state="indeterminate"]',
    ) as HTMLElement;

    for (const element of [badge, alert, emptyState, aspectRatio, spinner]) {
      expect(element.scrollWidth, element.outerHTML).toBeLessThanOrEqual(wrapper.clientWidth);
    }

    expect(getComputedStyle(badge).maxWidth).toBe("100%");
    expect(getComputedStyle(badge).overflowWrap).toBe("normal");
    expect(px(getComputedStyle(badgeIcon).width)).toBe(16);
    expect(getComputedStyle(alert).minWidth).toBe("0px");
    expect(getComputedStyle(alertTitle).overflowWrap).toBe("anywhere");
    expect(getComputedStyle(alertDescription).overflowWrap).toBe("anywhere");
    expect(getComputedStyle(emptyState).minWidth).toBe("0px");
    expect(getComputedStyle(emptyActions).flexWrap).toBe("wrap");
    expect(getComputedStyle(aspectRatio).maxWidth).toBe("100%");
    expect(px(getComputedStyle(spinner).width)).toBe(36);
  });

  it("should keeps the manual audit page overflow-free from mobile through desktop widths", async () => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      document.body.innerHTML = "";
      const iframe = await loadAuditFrame(width);
      const doc = iframe.contentDocument!;
      const root = doc.documentElement;
      const overflowing = [...doc.querySelectorAll("body *")]
        .filter((el) => {
          const htmlEl = el as HTMLElement;
          return (
            htmlEl.scrollWidth > htmlEl.clientWidth + 2 &&
            doc.defaultView!.getComputedStyle(htmlEl).overflow !== "hidden"
          );
        })
        .slice(0, 5)
        .map((el) => {
          const htmlEl = el as HTMLElement;
          return `${el.tagName.toLowerCase()} ${htmlEl.className} ${el.getAttribute("data-slot")}`;
        });

      expect(root.scrollWidth - root.clientWidth, `page overflow at ${width}px`).toBe(0);
      expect(overflowing, `element overflow at ${width}px`).toEqual([]);
      expect(doc.querySelectorAll(".component-card").length).toBeGreaterThanOrEqual(22);
    }
  });

  it("should keeps constrained desktop navbar brand and actions visible", async () => {
    document.body.innerHTML = "";
    const iframe = await loadAuditFrame(1024);
    const doc = iframe.contentDocument!;
    const navbar = doc.querySelector(
      '#chrome .preview[data-theme="light"] [data-slot="navbar"]',
    ) as HTMLElement;
    const brand = navbar.querySelector('[data-slot="nav-brand"]') as HTMLElement;
    const brandLink = brand.querySelector("a") as HTMLElement;
    const toggle = navbar.querySelector('[data-slot="navbar-toggle"]') as HTMLElement;
    const endGroup = navbar.querySelector('[data-visual-end-group="true"]') as HTMLElement;
    const action = endGroup.querySelector('[data-slot="button"]') as HTMLElement;

    expect(navbar.getBoundingClientRect().width).toBeLessThan(480);
    expect(navbar.getAttribute("data-collapse-at")).toBe("md");
    expect(brand.getBoundingClientRect().width).toBeGreaterThan(20);
    expect(brandLink.getBoundingClientRect().height).toBeGreaterThanOrEqual(36);
    expect(getComputedStyle(brandLink).textDecorationLine).toBe("none");
    expect(getComputedStyle(toggle).display).toBe("none");
    expect(endGroup.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(action.getBoundingClientRect().width).toBeGreaterThanOrEqual(36);
  });

  it("should keeps manual audit navbar collapsed and readable on mobile", async () => {
    document.body.innerHTML = "";
    const iframe = await loadAuditFrame(320);
    const doc = iframe.contentDocument!;
    const navbar = doc.querySelector(
      '#chrome .preview[data-theme="light"] [data-slot="navbar"]',
    ) as HTMLElement;
    const brand = navbar.querySelector('[data-slot="nav-brand"]') as HTMLElement;
    const brandLink = brand.querySelector("a") as HTMLElement;
    const content = navbar.querySelector('[data-slot="navbar-content"]') as HTMLElement;
    const toggle = navbar.querySelector('[data-slot="navbar-toggle"]') as HTMLElement;

    expect(navbar.getAttribute("data-collapse-at")).toBe("md");
    expect(getComputedStyle(toggle).display).not.toBe("none");
    expect(getComputedStyle(content).display).toBe("flex");
    expect(getComputedStyle(content).flexDirection).toBe("column");
    expect(brandLink.getBoundingClientRect().height).toBeGreaterThanOrEqual(36);
    expect(getComputedStyle(brandLink).textDecorationLine).toBe("none");
    expect(content.scrollWidth).toBeLessThanOrEqual(navbar.clientWidth);
  });

  it("should keeps table density readable inside the mobile audit width", async () => {
    document.body.innerHTML = "";
    const iframe = await loadAuditFrame(320);
    const doc = iframe.contentDocument!;
    const table = doc.querySelector(
      '#surfaces .preview[data-theme="light"] [data-slot="table"]',
    ) as HTMLElement;
    const headerCell = table.querySelector('[data-slot="table-header-cell"]') as HTMLElement;
    const bodyCell = table.querySelector('[data-slot="table-cell"]') as HTMLElement;

    expect(getComputedStyle(table).tableLayout).toBe("fixed");
    expect(table.scrollWidth).toBeLessThanOrEqual(table.clientWidth + 4);
    expect(headerCell.scrollWidth).toBeLessThanOrEqual(headerCell.clientWidth);
    expect(bodyCell.scrollWidth).toBeLessThanOrEqual(bodyCell.clientWidth);
    expect(px(getComputedStyle(headerCell).paddingInlineStart)).toBeLessThanOrEqual(8);
    expect(getComputedStyle(headerCell).letterSpacing).toBe("normal");
  });

  it("should keeps oversized block presets inside narrow containers", () => {
    document.body.innerHTML = `
      <div style="width: 320px; overflow: auto;">
        <div data-slot="block">
          <article class="card" data-slot="card">One</article>
          <article class="card" data-slot="card">Two</article>
        </div>
      </div>
    `;

    const wrapper = document.body.firstElementChild as HTMLElement;
    const block = wrapper.querySelector('[data-slot="block"]') as HTMLElement;

    expect(block.scrollWidth).toBeLessThanOrEqual(wrapper.clientWidth);
    expect(getComputedStyle(block).gridTemplateColumns).not.toContain("480px");
  });

  it("should keeps mobile overlays and horizontal groups within a 320px surface", () => {
    document.body.innerHTML = `
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
    `;

    const wrapper = document.body.firstElementChild as HTMLElement;
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

    for (const selector of checked) {
      const element = wrapper.querySelector(selector) as HTMLElement;
      expect(element.scrollWidth, selector).toBeLessThanOrEqual(wrapper.clientWidth);
    }

    const popoverTrigger = wrapper.querySelector('[data-slot="popover-trigger"]') as HTMLElement;
    const popoverContent = wrapper.querySelector('[data-slot="popover-content"]') as HTMLElement;

    expect(px(getComputedStyle(popoverTrigger).minHeight)).toBeGreaterThanOrEqual(24);
    expect(px(getComputedStyle(popoverContent).width)).toBeGreaterThan(220);
  });

  it("should keeps overlay motion states stable and non-interactive while closing", () => {
    document.body.innerHTML = `
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
    `;

    const wrapper = document.body.firstElementChild as HTMLElement;
    const expectations = new Map([
      ['[data-slot="dialog-overlay"]', "ak-fade-out"],
      ['[data-slot="dialog-content"]', "ak-scale-out"],
      ['[data-slot="popover-content"]', "ak-slide-up-out"],
      ['[data-slot="dropdown-content"]', "ak-menu-out"],
      ['[data-slot="select-content"]', "ak-select-out"],
      ['[data-slot="tooltip-content"]', "ak-tooltip-out"],
      ['[data-slot="toast"]', "ak-toast-out"],
    ]);

    for (const [selector, animationName] of expectations) {
      const element = wrapper.querySelector(selector) as HTMLElement;
      const style = getComputedStyle(element);
      expect(style.animationName, selector).toBe(animationName);
      expect(style.pointerEvents, selector).toBe("none");
      if (selector !== '[data-slot="dialog-overlay"]') {
        expect(element.scrollWidth, selector).toBeLessThanOrEqual(wrapper.clientWidth);
      }
    }

    expect(
      getComputedStyle(wrapper.querySelector('[data-slot="dialog-content"]')!).transformOrigin,
    ).not.toBe("0px 0px");
    expect(
      getComputedStyle(wrapper.querySelector('[data-slot="tooltip-content"]')!).overflowWrap,
    ).toBe("anywhere");
  });

  it("should keeps semantic navigation slots compact and contained", () => {
    document.body.innerHTML = `
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
    `;

    for (const selector of [
      '[data-slot="navbar"] [data-slot="nav-item"]',
      '[data-slot="sidebar"] [data-slot="nav-item"]',
    ]) {
      const item = document.querySelector(selector) as HTMLElement;
      const style = getComputedStyle(item);
      expect(item.scrollWidth, selector).toBeLessThanOrEqual(window.innerWidth);
      expect(px(style.minHeight), selector).toBeGreaterThan(0);
      expect(px(style.paddingInlineStart), selector).toBeGreaterThan(0);
      expect(style.overflowWrap, selector).toBe("anywhere");
    }

    const active = document.querySelector(
      '[data-slot="nav-item"][data-active="true"]',
    ) as HTMLElement;
    expect(getComputedStyle(active).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("should keeps page header and toolbar action rows wrap-safe", () => {
    document.body.innerHTML = `
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
    `;

    for (const selector of ['[data-slot="page-header-actions"]', '[data-slot="toolbar-actions"]']) {
      const actions = document.querySelector(selector) as HTMLElement;
      expect(getComputedStyle(actions).flexWrap, selector).toBe("wrap");
    }

    expect(
      getComputedStyle(document.querySelector('[data-slot="page-header-title"]')!).marginTop,
    ).toBe("0px");
    expect(getComputedStyle(document.querySelector('[data-slot="toolbar-title"]')!).marginTop).toBe(
      "0px",
    );
  });
});
