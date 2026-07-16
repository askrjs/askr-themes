import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { Block, Main, NavGroup, NavLink, Navbar, Sidebar } from "../../src/core";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "../../src/overlays";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => requestAnimationFrame(resolve));
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
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
  });

  it("should compose real Dropdown primitives inside navbar and sidebar recipes", async () => {
    route("/docs", () => (
      <Block minHeight="screen" direction="row">
        <Sidebar aria-label="Sidebar navigation">
          <NavGroup title="Workspace">
            <Dropdown id="sidebar-workspace-dropdown">
              <DropdownTrigger>Workspace</DropdownTrigger>
              <DropdownContent aria-label="Sidebar workspace menu" side="right" sideOffset={4}>
                <DropdownItem asChild>
                  <NavLink href="/docs/audit">Audit log</NavLink>
                </DropdownItem>
                <DropdownItem>Switch workspace</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </NavGroup>
        </Sidebar>
        <Main>
          <Navbar aria-label="Navbar navigation">
            <NavGroup title="Docs">
              <Dropdown id="navbar-product-dropdown">
                <DropdownTrigger>Product</DropdownTrigger>
                <DropdownContent aria-label="Product menu" sideOffset={4}>
                  <DropdownItem asChild>
                    <NavLink href="/docs/components">Components</NavLink>
                  </DropdownItem>
                  <DropdownItem>Copy link</DropdownItem>
                </DropdownContent>
              </Dropdown>
            </NavGroup>
          </Navbar>
        </Main>
      </Block>
    ));
    route("/docs/audit", () => <div id="page">Audit log</div>);
    route("/docs/components", () => <div id="page">Components</div>);

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

    productLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );
    await settle();

    expect(window.location.pathname).toBe("/docs/components");

    cleanupApp(container!);
    window.history.replaceState({}, "", "/docs");
    clearRoutes();
    route("/docs", () => (
      <Sidebar aria-label="Sidebar navigation">
        <NavGroup title="Workspace">
          <Dropdown id="sidebar-workspace-dropdown">
            <DropdownTrigger>Workspace</DropdownTrigger>
            <DropdownContent aria-label="Sidebar workspace menu" side="right" sideOffset={4}>
              <DropdownItem>Switch workspace</DropdownItem>
            </DropdownContent>
          </Dropdown>
        </NavGroup>
      </Sidebar>
    ));
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const sidebarTrigger = container?.querySelector(
      '[aria-label="Sidebar navigation"] [data-slot="dropdown-trigger"]',
    ) as HTMLButtonElement | null;
    sidebarTrigger?.click();
    await settle();

    const sidebarMenu = getDropdownContent("Sidebar workspace menu");
    expect(sidebarMenu?.getAttribute("data-side")).toBe("right");
    expect(sidebarMenu?.getAttribute("data-align")).toBe("start");
  });
});
