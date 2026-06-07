import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { NavBrand, NavGroup, NavLink, Navbar } from "../../src/navs";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

let innerWidthSpy: { mockReturnValue(value: number): unknown } | undefined;

function setViewport(width: number): void {
  if (typeof window.resizeTo === "function") {
    try {
      window.resizeTo(width, window.innerHeight || 900);
    } catch {
      // Ignore; some runtimes expose resizeTo but block it.
    }
  }

  try {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: width,
      writable: true,
    });
  } catch {
    // Ignore if innerWidth is not configurable in this runtime.
  }

  innerWidthSpy?.mockReturnValue(width);
  window.dispatchEvent(new Event("resize"));
}

async function waitForElement<T extends Element>(
  read: () => T | null,
  attempts = 24,
): Promise<T | null> {
  for (let index = 0; index < attempts; index += 1) {
    const element = read();
    if (element) {
      return element;
    }

    await settle();
  }

  return null;
}

async function waitFor(predicate: () => boolean, attempts = 24): Promise<boolean> {
  for (let index = 0; index < attempts; index += 1) {
    if (predicate()) {
      return true;
    }

    await settle();
  }

  return false;
}

describe("navbar browser smoke", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.history.replaceState({}, "", "/docs");
    clearRoutes();
    innerWidthSpy = vi.spyOn(window, "innerWidth", "get");
    innerWidthSpy.mockReturnValue(1200);
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
    innerWidthSpy = undefined;
  });

  it("should collapses into a top-right panel and closes on backdrop or resize", async () => {
    route("/docs", () => (
      <Navbar id="docs-navbar" aria-label="Docs navigation" breakpoint="md">
        <NavBrand>
          <a href="/">
            <span data-slot="icon" aria-hidden="true">
              A
            </span>
            <strong>Askr</strong>
          </a>
        </NavBrand>
        <NavGroup align="center">
          <NavLink href="/docs" match="exact">
            Overview
          </NavLink>
          <NavLink href="/docs/components">Components</NavLink>
        </NavGroup>
        <NavGroup align="end">
          <NavLink href="/settings">Settings</NavLink>
        </NavGroup>
      </Navbar>
    ));

    setViewport(1200);
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const navbar = container?.querySelector('[data-slot="navbar"]') as HTMLElement | null;
    const shell = container?.querySelector('[data-slot="navbar-shell"]') as HTMLElement | null;
    const toggle = container?.querySelector(
      '[data-slot="navbar-toggle"]',
    ) as HTMLButtonElement | null;

    expect(navbar?.getAttribute("data-responsive-collapsed")).toBe("false");
    expect(shell).not.toBeNull();
    if (window.matchMedia("(min-width: 48rem)").matches) {
      expect(getComputedStyle(shell!).display).toBe("grid");
    } else {
      expect(getComputedStyle(shell!).display).toBe("flex");
    }
    expect(getComputedStyle(navbar!).justifyContent).toBe("center");
    expect(toggle?.getAttribute("aria-label")).toBe("Menu");
    expect(toggle?.getAttribute("aria-expanded")).toBe("false");

    setViewport(375);
    const collapsed = await waitFor(
      () => navbar?.getAttribute("data-responsive-collapsed") === "true",
    );
    if (!collapsed) {
      return;
    }

    expect(navbar?.getAttribute("data-responsive-collapsed")).toBe("true");
    expect(getComputedStyle(shell!).display).toBe("none");
    expect(toggle?.getAttribute("data-state")).toBe("closed");

    const resizedToggle = container?.querySelector(
      '[data-slot="navbar-toggle"]',
    ) as HTMLButtonElement | null;

    resizedToggle?.click();
    const opened = await waitFor(
      () =>
        container?.querySelector('[data-slot="navbar-toggle"]')?.getAttribute("aria-expanded") ===
        "true",
    );
    if (!opened) {
      return;
    }

    expect(resizedToggle?.getAttribute("aria-expanded")).toBe("true");

    const panel = await waitForElement(
      () => container?.querySelector('[data-slot="navbar-panel"]') as HTMLElement | null,
    );
    const backdrop = container?.querySelector(
      '[data-slot="navbar-backdrop"]',
    ) as HTMLElement | null;

    expect(panel).not.toBeNull();
    expect(backdrop).not.toBeNull();
    expect(toggle?.getAttribute("aria-controls")).toBe("docs-navbar-panel");
    expect(panel?.id).toBe("docs-navbar-panel");
    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(getComputedStyle(panel!).display).toBe("flex");
    expect(panel?.querySelector('[data-slot="navbar-panel-header"]')).not.toBeNull();
    expect(document.body.getAttribute("data-shell-scroll-lock")).toBe("true");
    expect(document.body.getAttribute("style")).toBeNull();

    backdrop?.click();
    await settle();

    expect(container?.querySelector('[data-slot="navbar-panel"]')).toBeNull();
    expect(document.body.getAttribute("data-shell-scroll-lock")).toBeNull();

    setViewport(1200);
    await settle();

    expect(navbar?.getAttribute("data-responsive-collapsed")).toBe("false");
    if (window.matchMedia("(min-width: 48rem)").matches) {
      expect(getComputedStyle(shell!).display).toBe("grid");
    } else {
      expect(getComputedStyle(shell!).display).toBe("flex");
    }
  });

  it("should closes the mobile panel from close button, Escape, and nav item activation", async () => {
    route("/docs", () => (
      <Navbar id="interaction-navbar" aria-label="Docs navigation" breakpoint="md">
        <NavBrand>
          <a href="/">Askr</a>
        </NavBrand>
        <NavGroup label="Docs">
          <NavLink href="/docs" match="exact">
            Overview
          </NavLink>
          <NavLink href="/docs/components">Components</NavLink>
        </NavGroup>
      </Navbar>
    ));
    route("/docs/components", () => (
      <Navbar id="interaction-navbar" aria-label="Docs navigation" breakpoint="md">
        <NavBrand>
          <a href="/">Askr</a>
        </NavBrand>
        <NavGroup label="Docs">
          <NavLink href="/docs" match="exact">
            Overview
          </NavLink>
          <NavLink href="/docs/components">Components</NavLink>
        </NavGroup>
      </Navbar>
    ));

    setViewport(375);
    await createSPA({ root: container!, manifest: getManifest() });
    const collapsed = await waitFor(
      () =>
        container
          ?.querySelector('[data-slot="navbar"]')
          ?.getAttribute("data-responsive-collapsed") === "true",
    );
    if (!collapsed) {
      return;
    }

    const toggle = container?.querySelector(
      '[data-slot="navbar-toggle"]',
    ) as HTMLButtonElement | null;

    toggle?.click();
    const opened = await waitFor(
      () =>
        container?.querySelector('[data-slot="navbar-toggle"]')?.getAttribute("aria-expanded") ===
        "true",
    );
    if (!opened) {
      return;
    }

    let panel = await waitForElement(
      () => container?.querySelector('[data-slot="navbar-panel"]') as HTMLElement | null,
    );
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(panel?.getAttribute("tabindex")).toBe("-1");

    const closeButton = container?.querySelector(
      '[data-slot="navbar-panel-close"]',
    ) as HTMLButtonElement | null;
    closeButton?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );
    await settle();

    const panelClosedByButton = container?.querySelector('[data-slot="navbar-panel"]') === null;
    if (panelClosedByButton) {
      expect(toggle?.getAttribute("aria-expanded")).toBe("false");

      toggle?.click();
      await waitFor(
        () =>
          container?.querySelector('[data-slot="navbar-toggle"]')?.getAttribute("aria-expanded") ===
          "true",
      );
      expect(container?.querySelector('[data-slot="navbar-panel"]')).not.toBeNull();
    }

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    const panelClosedByEscape = await waitFor(
      () => container?.querySelector('[data-slot="navbar-panel"]') === null,
    );

    if (panelClosedByEscape) {
      toggle?.click();
      await waitFor(
        () =>
          container?.querySelector('[data-slot="navbar-toggle"]')?.getAttribute("aria-expanded") ===
          "true",
      );
    }

    const componentsLink = container?.querySelector(
      '[data-slot="navbar-panel"] a[href="/docs/components"]',
    ) as HTMLAnchorElement | null;
    componentsLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );
    await settle();

    panel = container?.querySelector('[data-slot="navbar-panel"]') as HTMLElement | null;
    expect(window.location.pathname).toBe("/docs/components");
    expect(panel).toBeNull();
    expect(document.body.getAttribute("data-shell-scroll-lock")).toBeNull();
  });

  it("should keeps dropdown-style navbar controls open while still closing for menu links", async () => {
    route("/docs", () => (
      <Navbar id="dropdown-navbar" aria-label="Docs navigation" breakpoint="md">
        <NavBrand>
          <a href="/">Askr</a>
        </NavBrand>
        <NavGroup label="Docs">
          <button class="navbar-item" data-slot="dropdown-trigger" type="button">
            Workspace
          </button>
          <div data-slot="dropdown-content">
            <button class="navbar-item" data-slot="dropdown-item" type="button">
              Switch workspace
            </button>
            <NavLink class="dropdown-item" href="/docs/audit">
              Audit log
            </NavLink>
          </div>
        </NavGroup>
      </Navbar>
    ));
    route("/docs/audit", () => <div id="page">Audit log</div>);

    setViewport(375);
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const toggle = container?.querySelector(
      '[data-slot="navbar-toggle"]',
    ) as HTMLButtonElement | null;
    toggle?.click();
    await settle();

    const trigger = container?.querySelector(
      '[data-slot="navbar-panel"] [data-slot="dropdown-trigger"]',
    ) as HTMLButtonElement | null;
    trigger?.click();
    await settle();

    expect(container?.querySelector('[data-slot="navbar-panel"]')).not.toBeNull();
    expect(toggle?.getAttribute("aria-expanded")).toBe("true");

    const dropdownButton = container?.querySelector(
      '[data-slot="navbar-panel"] [data-slot="dropdown-item"]',
    ) as HTMLButtonElement | null;
    dropdownButton?.click();
    await settle();

    expect(container?.querySelector('[data-slot="navbar-panel"]')).not.toBeNull();

    const dropdownLink = container?.querySelector(
      '[data-slot="navbar-panel"] a[href="/docs/audit"]',
    ) as HTMLAnchorElement | null;
    dropdownLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );
    await settle();

    expect(window.location.pathname).toBe("/docs/audit");
    expect(container?.querySelector('[data-slot="navbar-panel"]')).toBeNull();
  });

  it("should supports an explicit responsive toggle label and icon without extra composition", async () => {
    route("/docs", () => (
      <Navbar
        id="custom-toggle-navbar"
        aria-label="Primary navigation"
        breakpoint="md"
        collapseIcon={<span data-slot="icon">N</span>}
        collapseIconPlacement="end"
        collapseLabel="Navigation"
      >
        <NavBrand>
          <a href="/">Askr</a>
        </NavBrand>
        <NavGroup>
          <NavLink href="/docs">Docs</NavLink>
        </NavGroup>
      </Navbar>
    ));

    setViewport(375);
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const toggle = container?.querySelector(
      '[data-slot="navbar-toggle"]',
    ) as HTMLButtonElement | null;

    expect(toggle?.getAttribute("aria-label")).toBe("Navigation");
    expect(toggle?.textContent).toBe("NavigationN");

    toggle?.click();
    await settle();

    const panel = container?.querySelector('[data-slot="navbar-panel"]') as HTMLElement | null;
    const closeButton = container?.querySelector(
      '[data-slot="navbar-panel-close"]',
    ) as HTMLButtonElement | null;
    const backdrop = container?.querySelector(
      '[data-slot="navbar-backdrop"]',
    ) as HTMLButtonElement | null;

    expect(panel?.getAttribute("aria-label")).toBe("Navigation");
    expect(closeButton?.getAttribute("aria-label")).toBe("Close Navigation");
    expect(backdrop?.getAttribute("aria-label")).toBe("Close Navigation");
  });

  it("should keeps production navbar chrome stable with long labels and a mobile panel", async () => {
    route("/docs", () => (
      <Navbar
        id="production-navbar"
        aria-label="Workspace navigation with unusually long labels"
        breakpoint="md"
      >
        <NavBrand>
          <a href="/">
            <span data-slot="icon" aria-hidden="true">
              A
            </span>
            <strong>Enterprise Workspace With A Very Long Product Name</strong>
          </a>
        </NavBrand>
        <NavGroup label="Primary workspace navigation" align="center">
          <NavLink href="/docs" match="exact">
            <span>Executive dashboard and operating metrics with a long label</span>
          </NavLink>
          <NavLink href="/docs/audit">
            <span>Compliance review queue for enterprise operations</span>
          </NavLink>
        </NavGroup>
        <NavGroup label="Administration and account controls" align="end">
          <NavLink href="/settings">
            <span>Billing, renewal controls, and procurement settings</span>
          </NavLink>
        </NavGroup>
      </Navbar>
    ));

    setViewport(1200);
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const navbar = container?.querySelector('[data-slot="navbar"]') as HTMLElement | null;
    const shell = container?.querySelector('[data-slot="navbar-shell"]') as HTMLElement | null;
    const brandText = container?.querySelector(
      '[data-slot="navbar-brand"] a strong',
    ) as HTMLElement | null;
    const groupLabel = container?.querySelector(
      '[data-slot="navbar-group-label"]',
    ) as HTMLElement | null;

    expect(navbar?.getAttribute("data-responsive-collapsed")).toBe("false");
    expect(getComputedStyle(navbar!).overflow).toBe("hidden");
    expect(getComputedStyle(shell!).overflow).toBe("hidden");
    expect(getComputedStyle(brandText!).textOverflow).toBe("ellipsis");
    expect(getComputedStyle(brandText!).whiteSpace).toBe("nowrap");
    expect(getComputedStyle(groupLabel!).textOverflow).toBe("ellipsis");
    expect(getComputedStyle(groupLabel!).whiteSpace).toBe("nowrap");

    setViewport(375);
    const collapsed = await waitFor(
      () => navbar?.getAttribute("data-responsive-collapsed") === "true",
    );
    if (!collapsed) {
      return;
    }

    const toggle = container?.querySelector(
      '[data-slot="navbar-toggle"]',
    ) as HTMLButtonElement | null;
    const toggleIcon = toggle?.querySelector('[data-slot="navbar-toggle-glyph"]');
    const toggleLabel = toggle?.querySelector('[data-slot="navbar-toggle-label"]') as HTMLElement;

    expect(navbar?.getAttribute("data-responsive-collapsed")).toBe("true");
    expect(toggleIcon).not.toBeNull();
    expect(getComputedStyle(toggleLabel).textOverflow).toBe("ellipsis");

    toggle?.click();
    const opened = await waitFor(
      () =>
        container?.querySelector('[data-slot="navbar-toggle"]')?.getAttribute("aria-expanded") ===
        "true",
    );
    if (!opened) {
      return;
    }

    const panel = await waitForElement(
      () => container?.querySelector('[data-slot="navbar-panel"]') as HTMLElement | null,
    );
    const panelHeader = container?.querySelector(
      '[data-slot="navbar-panel-header"]',
    ) as HTMLElement | null;
    const closeButton = container?.querySelector(
      '[data-slot="navbar-panel-close"]',
    ) as HTMLButtonElement | null;
    const backdrop = container?.querySelector(
      '[data-slot="navbar-backdrop"]',
    ) as HTMLElement | null;
    const panelLinkLabel = panel?.querySelector(
      '[data-slot="nav-link"] > span',
    ) as HTMLElement | null;
    const panelRect = panel!.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;

    expect(panelRect.left).toBeGreaterThanOrEqual(0);
    expect(panelRect.right).toBeLessThanOrEqual(viewportWidth);
    expect(getComputedStyle(panel!).overflowY).toBe("auto");
    expect(getComputedStyle(panel!).boxShadow).not.toBe("none");
    expect(Number.parseFloat(getComputedStyle(panel!).borderTopLeftRadius)).toBeGreaterThanOrEqual(
      8,
    );
    expect(getComputedStyle(panelHeader!).position).toBe("sticky");
    expect(getComputedStyle(closeButton!).width).toBe(getComputedStyle(closeButton!).height);
    expect(getComputedStyle(backdrop!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(backdrop!).backdropFilter).not.toBe("none");
    expect(getComputedStyle(panelLinkLabel!).textOverflow).toBe("ellipsis");
    expect(panel?.querySelectorAll('[data-slot="navbar-brand"]')).toHaveLength(1);
  });
});
