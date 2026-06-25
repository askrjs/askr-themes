import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { NavBrand, NavDropdown, NavGroup, NavLink, Navbar, Sidebar } from "../../src/core";
import { DropdownItem } from "../../src/overlays";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("navbar and sidebar chrome contracts", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    clearRoutes();
    window.history.replaceState({}, "", "/docs");
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
  });

  it("should renders the navbar and sidebar chrome with stable slots", async () => {
    route("/docs", () => (
      <>
        <Navbar aria-label="Docs navigation" id="docs-navbar">
          <a href="/">Askr</a>
          <NavGroup title="Docs">
            <NavLink href="/docs" match="exact">
              Overview
            </NavLink>
            <NavLink href="/docs/components">Components</NavLink>
          </NavGroup>
        </Navbar>
        <Sidebar aria-label="Docs navigation" id="docs-sidebar">
          <a href="/">Askr</a>
          <NavGroup title="Docs">
            <NavLink href="/docs" match="exact">
              Overview
            </NavLink>
          </NavGroup>
        </Sidebar>
        <main id="page">Docs</main>
      </>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const navbar = container?.querySelector('[data-slot="navbar"]') as HTMLElement | null;
    const navbarGroup = container?.querySelector(
      '#docs-navbar [data-slot="nav-group"]',
    ) as HTMLElement | null;
    const navbarLabel = container?.querySelector(
      '#docs-navbar [data-slot="nav-group-label"]',
    ) as HTMLElement | null;
    const sidebar = container?.querySelector('[data-slot="sidebar"]') as HTMLElement | null;
    const sidebarGroup = container?.querySelector(
      '#docs-sidebar [data-slot="nav-group"]',
    ) as HTMLElement | null;
    const navItems = container?.querySelectorAll('[data-slot="nav-item"]');

    expect(navbar).not.toBeNull();
    expect(navbar?.getAttribute("aria-label")).toBe("Docs navigation");
    expect(navbar?.textContent).toContain("Askr");
    expect(navbarGroup).not.toBeNull();
    expect(navbarLabel?.textContent).toBe("Docs");
    expect(sidebar).not.toBeNull();
    expect(sidebar?.getAttribute("aria-label")).toBe("Docs navigation");
    expect(sidebarGroup).not.toBeNull();
    expect(navItems?.length).toBe(3);
    expect(container?.querySelector("#page")?.textContent).toBe("Docs");
  });

  it("should renders responsive navbar and nav dropdown slots", async () => {
    route("/docs", () => (
      <Navbar aria-label="Responsive docs navigation" collapseAt="md" id="responsive-navbar">
        <NavBrand as="a" href="/">
          Askr
        </NavBrand>
        <NavLink href="/docs" match="exact">
          Overview
        </NavLink>
        <NavDropdown label="More" defaultOpen>
          <DropdownItem asChild>
            <NavLink href="/docs/components">Components</NavLink>
          </DropdownItem>
        </NavDropdown>
      </Navbar>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const navbar = container?.querySelector("#responsive-navbar") as HTMLElement | null;
    const brand = container?.querySelector('[data-slot="nav-brand"]') as HTMLElement | null;
    const content = container?.querySelector('[data-slot="navbar-content"]') as HTMLElement | null;
    const toggle = container?.querySelector('[data-slot="navbar-toggle"]') as HTMLElement | null;
    const dropdownTrigger = container?.querySelector(
      '[data-slot="nav-dropdown-trigger"]',
    ) as HTMLElement | null;
    const dropdownContent = document.body.querySelector(
      '[data-slot="nav-dropdown-content"]',
    ) as HTMLElement | null;

    expect(navbar?.getAttribute("data-collapse-at")).toBe("md");
    expect(brand?.textContent).toBe("Askr");
    expect(content).not.toBeNull();
    expect(content?.querySelector('[data-slot="nav-brand"]')).toBeNull();
    expect(content?.querySelectorAll('[data-slot="nav-item"]').length).toBe(1);
    expect(toggle?.getAttribute("aria-label")).toBe("Menu");
    expect(dropdownTrigger?.textContent).toBe("More");
    expect(dropdownContent?.textContent).toContain("Components");
  });
});
