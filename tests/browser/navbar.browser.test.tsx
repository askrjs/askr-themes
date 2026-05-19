import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { NavBrand, NavGroup, NavLink, Navbar } from "../../src/navs";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

let innerWidthSpy: { mockReturnValue(value: number): unknown } | undefined;

function setViewport(width: number): void {
  innerWidthSpy?.mockReturnValue(width);
  window.dispatchEvent(new Event("resize"));
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

  it("collapses into a top-right panel and closes on backdrop or resize", async () => {
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
    await settle();

    expect(navbar?.getAttribute("data-responsive-collapsed")).toBe("true");
    expect(getComputedStyle(shell!).display).toBe("none");
    expect(toggle?.getAttribute("data-state")).toBe("closed");

    const resizedToggle = container?.querySelector(
      '[data-slot="navbar-toggle"]',
    ) as HTMLButtonElement | null;

    resizedToggle?.click();
    await settle();

    expect(resizedToggle?.getAttribute("aria-expanded")).toBe("true");

    const panel = container?.querySelector('[data-slot="navbar-panel"]') as HTMLElement | null;
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

    backdrop?.click();
    await settle();

    expect(container?.querySelector('[data-slot="navbar-panel"]')).toBeNull();

    setViewport(1200);
    await settle();

    expect(navbar?.getAttribute("data-responsive-collapsed")).toBe("false");
    if (window.matchMedia("(min-width: 48rem)").matches) {
      expect(getComputedStyle(shell!).display).toBe("grid");
    } else {
      expect(getComputedStyle(shell!).display).toBe("flex");
    }
  });

  it("keeps production navbar chrome stable with long labels and a mobile panel", async () => {
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
    await settle();

    const toggle = container?.querySelector(
      '[data-slot="navbar-toggle"]',
    ) as HTMLButtonElement | null;
    const toggleIcon = toggle?.querySelector('[data-slot="navbar-toggle-glyph"]');
    const toggleLabel = toggle?.querySelector('[data-slot="navbar-toggle-label"]') as HTMLElement;

    expect(navbar?.getAttribute("data-responsive-collapsed")).toBe("true");
    expect(toggleIcon).not.toBeNull();
    expect(getComputedStyle(toggleLabel).textOverflow).toBe("ellipsis");

    toggle?.click();
    await settle();

    const panel = container?.querySelector('[data-slot="navbar-panel"]') as HTMLElement | null;
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
