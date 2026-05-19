import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { NavBrand, NavGroup, NavLink, Navbar, Sidebar } from "../../src/navs";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("navbar and sidebar shell contracts", () => {
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

  it("renders the navbar and sidebar chrome with stable shell slots", async () => {
    route("/docs", () => (
      <>
        <Navbar aria-label="Docs navigation" id="docs-navbar">
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
        <Sidebar aria-label="Docs navigation" id="docs-sidebar">
          <NavBrand>
            <a href="/">Askr</a>
          </NavBrand>
          <NavGroup label="Docs">
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
    const navbarBrand = container?.querySelector(
      '[data-slot="navbar-brand"]',
    ) as HTMLElement | null;
    const navbarGroup = container?.querySelector(
      '[data-slot="navbar-group"]',
    ) as HTMLElement | null;
    const sidebar = container?.querySelector('[data-slot="sidebar"]') as HTMLElement | null;
    const sidebarShell = container?.querySelector(
      '[data-slot="sidebar-shell"]',
    ) as HTMLElement | null;

    expect(navbar).not.toBeNull();
    expect(navbar?.getAttribute("aria-label")).toBe("Docs navigation");
    expect(navbarBrand?.textContent).toContain("Askr");
    expect(navbarGroup?.getAttribute("data-has-label")).toBe("true");
    expect(navbarGroup?.getAttribute("role")).toBe("group");
    expect(sidebar).not.toBeNull();
    expect(sidebar?.getAttribute("aria-label")).toBe("Docs navigation");
    expect(sidebarShell).not.toBeNull();
    expect(container?.querySelector("#page")?.textContent).toBe("Docs");
  });
});
