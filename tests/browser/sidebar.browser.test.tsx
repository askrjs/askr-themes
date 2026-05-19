import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import {
  NavBrand,
  NavGroup,
  NavLink,
  Shell,
  ShellMain,
  ShellNav,
  Sidebar,
  SidebarToggle,
} from "../../src/shells";

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

function TestIcon(props: { label: string }): JSX.Element {
  return (
    <span data-slot="icon" aria-hidden="true">
      {props.label.slice(0, 1)}
    </span>
  );
}

function RailExpandedIcon(): JSX.Element {
  return (
    <span data-slot="icon" data-state="expanded" aria-hidden="true">
      E
    </span>
  );
}

function RailCollapsedIcon(): JSX.Element {
  return (
    <span data-slot="icon" data-state="collapsed" aria-hidden="true">
      C
    </span>
  );
}

describe("sidebar browser smoke", () => {
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

  it("collapses into an icon rail and opens a drawer panel", async () => {
    const collapsedChanges: boolean[] = [];

    route("/docs", () => (
      <Shell variant="sidebar">
        <ShellNav>
          <Sidebar
            id="docs-sidebar"
            aria-label="Docs navigation"
            breakpoint="md"
            collapsible="icon"
            defaultCollapsed
            onCollapsedChange={(nextCollapsed) => {
              collapsedChanges.push(nextCollapsed);
            }}
          >
            <SidebarToggle
              expandedIcon={<RailExpandedIcon />}
              collapsedIcon={<RailCollapsedIcon />}
            />
            <NavBrand>
              <a href="/">
                <TestIcon label="Askr" />
                <strong>Askr</strong>
              </a>
            </NavBrand>
            <NavGroup label="Guides">
              <NavLink href="/docs" match="exact">
                <TestIcon label="Overview" />
                <span>Overview</span>
              </NavLink>
              <NavLink href="/docs/components">
                <TestIcon label="Components" />
                <span>Components</span>
              </NavLink>
            </NavGroup>
            <NavGroup align="end">
              <NavLink href="/settings">
                <TestIcon label="Settings" />
                <span>Settings</span>
              </NavLink>
            </NavGroup>
          </Sidebar>
        </ShellNav>
        <ShellMain>Docs content</ShellMain>
      </Shell>
    ));

    setViewport(1200);
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const sidebar = container?.querySelector('[data-slot="sidebar"]') as HTMLElement | null;
    const shellNav = container?.querySelector('[data-slot="shell-nav"]') as HTMLElement | null;
    const shell = container?.querySelector('[data-slot="sidebar-shell"]') as HTMLElement | null;
    const railToggle = container?.querySelector(
      '[data-slot="sidebar-rail-toggle"]',
    ) as HTMLButtonElement | null;
    const firstLink = container?.querySelector('[data-slot="nav-link"]') as HTMLElement | null;
    const firstIcon = firstLink?.querySelector('[data-slot="icon"]') as HTMLElement | null;
    const firstLabel = firstLink?.querySelector(
      ':scope > :not([data-slot="icon"])',
    ) as HTMLElement | null;

    expect(sidebar?.getAttribute("data-collapsible")).toBe("icon");
    expect(sidebar?.getAttribute("data-icon-collapsed")).toBe("true");
    expect(sidebar?.getAttribute("data-responsive-collapsed")).toBe("false");
    expect(railToggle?.getAttribute("aria-label")).toBe("Expand Docs navigation");
    expect(railToggle?.getAttribute("aria-expanded")).toBe("false");
    expect(railToggle?.querySelector('[data-slot="sidebar-rail-toggle-icon"]')).not.toBeNull();
    if (window.matchMedia("(min-width: 40rem)").matches) {
      expect(getComputedStyle(shellNav!).width).toBe("72px");
      expect(getComputedStyle(shellNav!).paddingLeft).toBe("0px");
      expect(getComputedStyle(shellNav!).paddingRight).toBe("0px");
    }
    expect(getComputedStyle(shell!).width).toBe("72px");
    expect(getComputedStyle(railToggle!).width).toBe(getComputedStyle(firstLink!).width);
    expect(getComputedStyle(railToggle!).height).toBe(getComputedStyle(firstLink!).height);
    expect(getComputedStyle(firstLink!).height).toBe(getComputedStyle(firstLink!).width);
    expect(getComputedStyle(firstLink!).justifyContent).toBe("center");
    expect(getComputedStyle(firstLabel!).position).toBe("absolute");
    expect(getComputedStyle(firstIcon!).width).not.toBe("0px");

    railToggle?.click();
    await settle();

    const expandedFirstLink = container?.querySelector(
      '[data-slot="nav-link"]',
    ) as HTMLElement | null;
    const expandedFirstLabel = expandedFirstLink?.querySelector(
      ':scope > :not([data-slot="icon"])',
    ) as HTMLElement | null;

    expect(collapsedChanges).toEqual([false]);
    expect(sidebar?.getAttribute("data-icon-collapsed")).toBe("false");
    expect(railToggle?.getAttribute("aria-label")).toBe("Collapse Docs navigation");
    expect(railToggle?.getAttribute("aria-expanded")).toBe("true");
    expect(getComputedStyle(shell!).width).not.toBe("72px");
    expect(getComputedStyle(expandedFirstLink!).width).not.toBe(
      getComputedStyle(railToggle!).width,
    );
    expect(getComputedStyle(expandedFirstLink!).justifyContent).toBe("flex-start");
    expect(getComputedStyle(expandedFirstLabel!).position).not.toBe("absolute");

    setViewport(375);
    await settle();

    const mobileToggle = container?.querySelector(
      '[data-slot="sidebar-toggle"]',
    ) as HTMLButtonElement | null;

    expect(sidebar?.getAttribute("data-responsive-collapsed")).toBe("true");
    expect(container?.querySelector('[data-slot="sidebar-rail-toggle"]')).toBeNull();
    expect(mobileToggle?.getAttribute("aria-label")).toBe("Docs navigation");
    expect(mobileToggle?.getAttribute("data-state")).toBe("closed");
    expect(mobileToggle?.querySelector('[data-slot="sidebar-toggle-icon"]')).not.toBeNull();
    expect(getComputedStyle(sidebar!).width).not.toBe("72px");
    expect(getComputedStyle(shell!).display).toBe("none");

    const mobileToggleAfterEscape = container?.querySelector(
      '[data-slot="sidebar-toggle"]',
    ) as HTMLButtonElement | null;
    mobileToggleAfterEscape?.click();
    await settle();

    const panel = container?.querySelector('[data-slot="sidebar-panel"]') as HTMLElement | null;
    const backdrop = container?.querySelector(
      '[data-slot="sidebar-backdrop"]',
    ) as HTMLElement | null;

    expect(panel).not.toBeNull();
    expect(backdrop).not.toBeNull();
    expect(mobileToggle?.getAttribute("aria-controls")).toBe("docs-sidebar-panel");
    expect(panel?.id).toBe("docs-sidebar-panel");
    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(getComputedStyle(panel!).display).toBe("flex");
    expect(panel?.textContent).toContain("Askr");
    expect(panel?.textContent).toContain("Overview");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await settle();

    expect(container?.querySelector('[data-slot="sidebar-panel"]')).toBeNull();

    const mobileToggleAfterClose = container?.querySelector(
      '[data-slot="sidebar-toggle"]',
    ) as HTMLButtonElement | null;
    mobileToggleAfterClose?.click();
    await settle();

    expect(container?.querySelector('[data-slot="sidebar-panel"]')).not.toBeNull();

    const closeButton = container?.querySelector(
      '[data-slot="sidebar-panel-close"]',
    ) as HTMLButtonElement | null;
    closeButton?.click();
    await settle();

    expect(container?.querySelector('[data-slot="sidebar-panel"]')).toBeNull();

    const mobileToggleAfterCloseButton = container?.querySelector(
      '[data-slot="sidebar-toggle"]',
    ) as HTMLButtonElement | null;
    mobileToggleAfterCloseButton?.click();
    await settle();

    const reopenedBackdrop = container?.querySelector(
      '[data-slot="sidebar-backdrop"]',
    ) as HTMLElement | null;
    expect(reopenedBackdrop).not.toBeNull();

    reopenedBackdrop?.click();
    await settle();

    expect(container?.querySelector('[data-slot="sidebar-panel"]')).toBeNull();
  });

  it("supports controlled icon rail collapse", async () => {
    const collapsedChanges: boolean[] = [];

    route("/docs", () => (
      <Sidebar
        aria-label="Controlled docs navigation"
        collapsed
        collapsible="icon"
        onCollapsedChange={(nextCollapsed) => {
          collapsedChanges.push(nextCollapsed);
        }}
      >
        <SidebarToggle expandedIcon={<RailExpandedIcon />} collapsedIcon={<RailCollapsedIcon />} />
        <NavGroup label="Guides">
          <NavLink href="/docs" match="exact">
            <TestIcon label="Overview" />
            <span>Overview</span>
          </NavLink>
        </NavGroup>
      </Sidebar>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const sidebar = container?.querySelector('[data-slot="sidebar"]') as HTMLElement | null;
    const railToggle = container?.querySelector(
      '[data-slot="sidebar-rail-toggle"]',
    ) as HTMLButtonElement | null;

    expect(sidebar?.getAttribute("data-icon-collapsed")).toBe("true");
    expect(railToggle?.getAttribute("aria-label")).toBe("Expand Controlled docs navigation");

    railToggle?.click();
    await settle();

    expect(collapsedChanges).toEqual([false]);
    expect(sidebar?.getAttribute("data-icon-collapsed")).toBe("true");
  });

  it("keeps centered sidebar groups explicit in full view", async () => {
    route("/docs", () => (
      <Sidebar aria-label="Centered docs navigation">
        <NavGroup label="Centered" align="center">
          <NavLink href="/docs" match="exact">
            <TestIcon label="Overview" />
            <span>Overview</span>
          </NavLink>
        </NavGroup>
      </Sidebar>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const centeredLabel = container?.querySelector(
      '[data-slot="navbar-group-label"]',
    ) as HTMLElement | null;
    const centeredLink = container?.querySelector('[data-slot="nav-link"]') as HTMLElement | null;

    expect(getComputedStyle(centeredLabel!).textAlign).toBe("center");
    expect(getComputedStyle(centeredLink!).justifyContent).toBe("center");
  });

  it("does not apply desktop rail width to responsive mobile sidebars", async () => {
    route("/docs", () => (
      <Shell variant="sidebar">
        <ShellNav>
          <Sidebar
            id="docs-sidebar"
            aria-label="Docs navigation"
            breakpoint="lg"
            collapsible="icon"
            defaultCollapsed
          >
            <SidebarToggle
              expandedIcon={<RailExpandedIcon />}
              collapsedIcon={<RailCollapsedIcon />}
            />
            <NavGroup label="Guides">
              <NavLink href="/docs" match="exact">
                <TestIcon label="Overview" />
                <span>Overview</span>
              </NavLink>
            </NavGroup>
          </Sidebar>
        </ShellNav>
        <ShellMain>Docs content</ShellMain>
      </Shell>
    ));

    setViewport(800);
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const shellNav = container?.querySelector('[data-slot="shell-nav"]') as HTMLElement | null;
    const sidebar = container?.querySelector('[data-slot="sidebar"]') as HTMLElement | null;
    const shell = container?.querySelector('[data-slot="sidebar-shell"]') as HTMLElement | null;
    const mobileToggle = container?.querySelector(
      '[data-slot="sidebar-toggle"]',
    ) as HTMLButtonElement | null;

    expect(sidebar?.getAttribute("data-icon-collapsed")).toBe("true");
    expect(sidebar?.getAttribute("data-responsive-collapsed")).toBe("true");
    expect(container?.querySelector('[data-slot="sidebar-rail-toggle"]')).toBeNull();
    expect(mobileToggle).not.toBeNull();
    expect(getComputedStyle(shell!).display).toBe("none");
    expect(getComputedStyle(shellNav!).width).not.toBe("72px");
    expect(getComputedStyle(sidebar!).width).not.toBe("72px");
  });

  it("keeps production sidebar chrome stable with long labels and mobile drawers", async () => {
    route("/docs", () => (
      <Shell variant="sidebar">
        <ShellNav>
          <Sidebar
            id="production-sidebar"
            aria-label="Workspace navigation with unusually long labels"
            breakpoint="md"
            collapsible="icon"
          >
            <SidebarToggle
              expandedIcon={<RailExpandedIcon />}
              collapsedIcon={<RailCollapsedIcon />}
            />
            <NavBrand>
              <a href="/">
                <TestIcon label="Workspace" />
                <strong>Enterprise Workspace With A Very Long Name</strong>
              </a>
            </NavBrand>
            <NavGroup label="Primary workspace navigation">
              <NavLink href="/docs" match="exact">
                <TestIcon label="Dashboard" />
                <span>Executive dashboard and operating metrics with a long label</span>
              </NavLink>
              <NavLink href="/docs/audit">
                <TestIcon label="Audit" />
                <span>Compliance review queue for enterprise operations</span>
              </NavLink>
            </NavGroup>
            <NavGroup label="Administration">
              <NavLink href="/docs/billing">
                <TestIcon label="Billing" />
                <span>Billing, invoices, renewal controls, and procurement settings</span>
              </NavLink>
            </NavGroup>
          </Sidebar>
        </ShellNav>
        <ShellMain>Docs content</ShellMain>
      </Shell>
    ));

    setViewport(1200);
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const shellNav = container?.querySelector('[data-slot="shell-nav"]') as HTMLElement | null;
    const sidebarShell = container?.querySelector(
      '[data-slot="sidebar-shell"]',
    ) as HTMLElement | null;
    const activeLink = container?.querySelector(
      '[data-slot="nav-link"][aria-current="page"]',
    ) as HTMLElement | null;
    const activeLabel = activeLink?.querySelector(
      ':scope > :not([data-slot="icon"])',
    ) as HTMLElement | null;
    const groupLabel = container?.querySelector(
      '[data-slot="navbar-group-label"]',
    ) as HTMLElement | null;
    const brandLink = container?.querySelector(
      '[data-slot="navbar-brand"] a',
    ) as HTMLElement | null;

    if (window.matchMedia("(min-width: 40rem)").matches) {
      expect(getComputedStyle(shellNav!).position).toBe("sticky");
      expect(getComputedStyle(shellNav!).overflow).toBe("hidden");
    }
    expect(getComputedStyle(sidebarShell!).overflowY).toBe("auto");
    expect(getComputedStyle(sidebarShell!).minHeight).toBe("0px");
    expect(getComputedStyle(brandLink!).minHeight).toBe("38px");
    expect(getComputedStyle(groupLabel!).textOverflow).toBe("ellipsis");
    expect(getComputedStyle(groupLabel!).whiteSpace).toBe("nowrap");
    expect(getComputedStyle(activeLink!, "::before").content).not.toBe("none");
    expect(getComputedStyle(activeLink!, "::before").width).toBe("2px");
    expect(getComputedStyle(activeLabel!).overflow).toBe("hidden");
    expect(getComputedStyle(activeLabel!).textOverflow).toBe("ellipsis");
    expect(getComputedStyle(activeLabel!).whiteSpace).toBe("nowrap");

    setViewport(375);
    await settle();

    const mobileToggle = container?.querySelector(
      '[data-slot="sidebar-toggle"]',
    ) as HTMLButtonElement | null;
    mobileToggle?.click();
    await settle();

    const panel = container?.querySelector('[data-slot="sidebar-panel"]') as HTMLElement | null;
    const panelHeader = container?.querySelector(
      '[data-slot="sidebar-panel-header"]',
    ) as HTMLElement | null;
    const closeButton = container?.querySelector(
      '[data-slot="sidebar-panel-close"]',
    ) as HTMLButtonElement | null;
    const backdrop = container?.querySelector(
      '[data-slot="sidebar-backdrop"]',
    ) as HTMLElement | null;
    const panelRect = panel!.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;

    expect(panelRect.width).toBeLessThanOrEqual(viewportWidth);
    expect(getComputedStyle(panel!).overflowY).toBe("auto");
    expect(getComputedStyle(panel!).boxShadow).not.toBe("none");
    expect(Number.parseFloat(getComputedStyle(panel!).borderTopRightRadius)).toBeGreaterThanOrEqual(
      8,
    );
    expect(getComputedStyle(panelHeader!).position).toBe("sticky");
    expect(getComputedStyle(closeButton!).width).toBe(getComputedStyle(closeButton!).height);
    expect(getComputedStyle(backdrop!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(backdrop!).backdropFilter).not.toBe("none");
  });
});
