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
    expect(getComputedStyle(shell!).display).toBe("grid");
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
    expect(getComputedStyle(shell!).display).toBe("grid");
  });
});
