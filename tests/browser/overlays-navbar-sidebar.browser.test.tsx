import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { NavBrand, NavGroup, NavLink, Navbar } from "../../src/navs";
import { Shell, ShellMain, ShellNav, Sidebar } from "../../src/shells";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "../../src/overlays";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

let innerWidthSpy: { mockReturnValue(value: number): unknown } | undefined;

function setViewport(width: number): void {
  innerWidthSpy?.mockReturnValue(width);
  window.dispatchEvent(new Event("resize"));
}

function getDropdownContent(label: string): HTMLElement | null {
  return document.body.querySelector(
    `[data-slot="dropdown-content"][aria-label="${label}"]`,
  ) as HTMLElement | null;
}

describe("navbar and sidebar overlay recipes", () => {
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

  it("uses real Dropdown primitives in navbar and sidebar recipes", async () => {
    route("/docs", () => (
      <Shell variant="sidebar">
        <ShellNav>
          <Sidebar id="overlay-sidebar" aria-label="Sidebar navigation" breakpoint="md">
            <NavBrand>
              <a href="/">Askr</a>
            </NavBrand>
            <NavGroup label="Workspace">
              <Dropdown id="sidebar-workspace-dropdown">
                <DropdownTrigger class="navbar-item">Workspace</DropdownTrigger>
                <DropdownContent aria-label="Sidebar workspace menu" side="right" sideOffset={4}>
                  <DropdownItem asChild>
                    <NavLink href="/docs/audit">Audit log</NavLink>
                  </DropdownItem>
                  <DropdownItem>Switch workspace</DropdownItem>
                </DropdownContent>
              </Dropdown>
              <Dropdown id="sidebar-drawer-dropdown">
                <DropdownTrigger class="navbar-item">Drawer workspace</DropdownTrigger>
                <DropdownContent aria-label="Sidebar drawer menu" side="bottom" sideOffset={4}>
                  <DropdownItem>A very long workspace label that should stay readable</DropdownItem>
                  <DropdownItem disabled>Disabled workspace</DropdownItem>
                </DropdownContent>
              </Dropdown>
            </NavGroup>
          </Sidebar>
        </ShellNav>
        <ShellMain>
          <Navbar id="overlay-navbar" aria-label="Navbar navigation" breakpoint="md">
            <NavBrand>
              <a href="/">Askr</a>
            </NavBrand>
            <NavGroup label="Docs">
              <Dropdown id="navbar-product-dropdown">
                <DropdownTrigger class="navbar-item">Product</DropdownTrigger>
                <DropdownContent aria-label="Product menu" sideOffset={4}>
                  <DropdownItem asChild>
                    <NavLink href="/docs/components">Components</NavLink>
                  </DropdownItem>
                  <DropdownItem>Copy link</DropdownItem>
                </DropdownContent>
              </Dropdown>
            </NavGroup>
            <NavGroup label="Account" align="end">
              <Dropdown id="navbar-account-dropdown">
                <DropdownTrigger class="navbar-item">Account</DropdownTrigger>
                <DropdownContent aria-label="Account menu" align="end" sideOffset={4}>
                  <DropdownItem>Profile</DropdownItem>
                </DropdownContent>
              </Dropdown>
            </NavGroup>
          </Navbar>
        </ShellMain>
      </Shell>
    ));
    route("/docs/audit", () => <div id="page">Audit log</div>);
    route("/docs/components", () => <div id="page">Components</div>);

    setViewport(1200);
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const productTrigger = container?.querySelector(
      '[aria-label="Navbar navigation"] [data-slot="dropdown-trigger"]',
    ) as HTMLButtonElement | null;
    productTrigger?.click();
    await settle();

    const productMenu = getDropdownContent("Product menu");
    const productLink = document.body.querySelector(
      '[data-slot="dropdown-item"][href="/docs/components"]',
    ) as HTMLAnchorElement | null;

    expect(productMenu?.getAttribute("data-align")).toBe("start");
    expect(productLink?.getAttribute("role")).toBe("menuitem");
    expect(productLink?.getAttribute("match")).toBeNull();

    productMenu?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle();
    expect(getDropdownContent("Product menu")).toBeNull();

    const accountTrigger = container?.querySelectorAll(
      '[aria-label="Navbar navigation"] [data-slot="dropdown-trigger"]',
    )[1] as HTMLButtonElement | undefined;
    accountTrigger?.click();
    await settle();
    expect(getDropdownContent("Account menu")?.getAttribute("data-align")).toBe("end");
    getDropdownContent("Account menu")?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await settle();

    const sidebarTrigger = container?.querySelector(
      '[aria-label="Sidebar navigation"] [data-slot="dropdown-trigger"]',
    ) as HTMLButtonElement | null;
    sidebarTrigger?.click();
    await settle();

    const sidebarMenu = getDropdownContent("Sidebar workspace menu");
    expect(sidebarMenu?.getAttribute("data-side")).toBe("right");
    expect(sidebarMenu?.getAttribute("data-align")).toBe("start");
    sidebarMenu?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle();

    setViewport(375);
    await settle();

    const navbarToggle = container?.querySelector(
      '[aria-label="Navbar navigation"] [data-slot="navbar-toggle"]',
    ) as HTMLButtonElement | null;
    navbarToggle?.click();
    await settle();

    const panelTrigger = container?.querySelector(
      '[data-slot="navbar-panel"] [data-slot="dropdown-trigger"]',
    ) as HTMLButtonElement | null;
    panelTrigger?.click();
    await settle();
    expect(getDropdownContent("Product menu")).not.toBeNull();

    getDropdownContent("Product menu")?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await settle();

    expect(getDropdownContent("Product menu")).toBeNull();
    expect(container?.querySelector('[data-slot="navbar-panel"]')).not.toBeNull();

    const navbarClose = container?.querySelector(
      '[data-slot="navbar-panel-close"]',
    ) as HTMLButtonElement | null;
    navbarClose?.click();
    await settle();

    const sidebarToggle = container?.querySelector(
      '[aria-label="Sidebar navigation"] [data-slot="sidebar-toggle"]',
    ) as HTMLButtonElement | null;
    sidebarToggle?.click();
    await settle();

    const drawerTrigger = container?.querySelectorAll(
      '[data-slot="sidebar-panel"] [data-slot="dropdown-trigger"]',
    )[1] as HTMLButtonElement | undefined;
    drawerTrigger?.click();
    await settle();

    const drawerMenu = getDropdownContent("Sidebar drawer menu");
    const drawerRect = drawerMenu!.getBoundingClientRect();

    expect(drawerMenu?.getAttribute("data-side")).toBe("bottom");
    expect(drawerRect.left).toBeGreaterThanOrEqual(0);
    expect(drawerRect.right).toBeLessThanOrEqual(document.documentElement.clientWidth);
    expect(getComputedStyle(drawerMenu!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(drawerMenu!).boxShadow).not.toBe("none");

    drawerMenu?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await settle();
    expect(container?.querySelector('[data-slot="sidebar-panel"]')).not.toBeNull();

    const sidebarClose = container?.querySelector(
      '[data-slot="sidebar-panel-close"]',
    ) as HTMLButtonElement | null;
    sidebarClose?.click();
    await settle();
    expect(container?.querySelector('[data-slot="sidebar-panel"]')).toBeNull();
  });
});
