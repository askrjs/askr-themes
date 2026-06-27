import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, Link, route } from "@askrjs/askr/router";

import {
  Block,
  Container,
  Header,
  NavBrand,
  NavDropdown,
  NavGroup,
  NavLink,
  Navbar,
} from "../../src/core";
import { DropdownItem } from "../../src/overlays";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

function px(value: string): number {
  return Number.parseFloat(value.replace("px", ""));
}

function setViewport(width: number): void {
  if (typeof window.resizeTo === "function") {
    try {
      window.resizeTo(width, window.innerHeight || 900);
    } catch {
      // Ignore browser runtimes that expose resizeTo but block it.
    }
  }

  window.dispatchEvent(new Event("resize"));
}

describe("navbar browser smoke", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    setViewport(1200);
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

  it("should renders semantic navbar structure with Block layout styles", async () => {
    route("/docs", () => (
      <Header sticky>
        <Container>
          <Block direction="row" align="center" justify="between" paddingY="md">
            <a href="/">Askr</a>
            <Navbar aria-label="Docs navigation">
              <NavGroup title="Docs">
                <NavLink href="/docs" match="exact">
                  Overview
                </NavLink>
                <NavLink href="/docs/components">Components</NavLink>
              </NavGroup>
            </Navbar>
          </Block>
        </Container>
      </Header>
    ));
    route("/docs/components", () => <div id="page">Components</div>);

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const header = container?.querySelector('[data-slot="header"]') as HTMLElement | null;
    const navbar = container?.querySelector('[data-slot="navbar"]') as HTMLElement | null;
    const group = container?.querySelector('[data-slot="nav-group"]') as HTMLElement | null;
    const label = container?.querySelector('[data-slot="nav-group-label"]') as HTMLElement | null;
    const activeItem = container?.querySelector('[data-active="true"]') as HTMLElement | null;
    const link = container?.querySelector('a[href="/docs/components"]') as HTMLAnchorElement | null;

    expect(header).not.toBeNull();
    expect(navbar?.getAttribute("aria-label")).toBe("Docs navigation");
    expect(group).not.toBeNull();
    expect(label?.textContent).toBe("Docs");
    expect(activeItem?.textContent).toBe("Overview");
    expect(getComputedStyle(navbar!).display).toBe("grid");
    expect(getComputedStyle(group!).justifySelf).toBe("center");
    expect(px(getComputedStyle(navbar!).columnGap)).toBeGreaterThan(0);
    expect(getComputedStyle(group!).flexDirection).toBe("column");
    expect(
      getComputedStyle(group!.querySelector('[data-slot="nav-group-body"]') as HTMLElement)
        .flexDirection,
    ).toBe("row");
    expect(px(getComputedStyle(activeItem!).paddingInlineStart)).toBeGreaterThan(0);

    link?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );
    await settle();

    expect(window.location.pathname).toBe("/docs/components");
    expect(container?.querySelector("#page")?.textContent).toBe("Components");
  });

  it("should centers primary routes between brand and end actions", async () => {
    route("/docs", () => (
      <Header sticky>
        <Container>
          <Navbar aria-label="App navigation">
            <NavBrand asChild>
              <Link href="/">Askr</Link>
            </NavBrand>
            <NavGroup>
              <NavLink href="/docs" match="exact">
                Overview
              </NavLink>
              <NavLink href="/docs/components">Components</NavLink>
              <NavLink href="/docs/contact">Contact</NavLink>
            </NavGroup>
            <NavGroup align="end">
              <button data-slot="button">Theme</button>
            </NavGroup>
          </Navbar>
        </Container>
      </Header>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const navbar = container?.querySelector('[data-slot="navbar"]') as HTMLElement | null;
    const primaryGroup = container?.querySelector(
      '[data-slot="navbar"] > [data-slot="nav-group"]:not([data-align="end"])',
    ) as HTMLElement | null;
    const endGroup = container?.querySelector(
      '[data-slot="navbar"] > [data-slot="nav-group"][data-align="end"]',
    ) as HTMLElement | null;
    const activeItem = container?.querySelector(
      '[data-slot="nav-item"][aria-current="page"]',
    ) as HTMLElement | null;

    const navbarRect = navbar!.getBoundingClientRect();
    const primaryRect = primaryGroup!.getBoundingClientRect();
    const navbarCenter = navbarRect.left + navbarRect.width / 2;
    const primaryCenter = primaryRect.left + primaryRect.width / 2;

    expect(Math.abs(primaryCenter - navbarCenter)).toBeLessThanOrEqual(1);
    expect(getComputedStyle(endGroup!).justifySelf).toBe("end");
    expect(getComputedStyle(activeItem!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(activeItem!).boxShadow).toBe("none");
    expect(getComputedStyle(activeItem!).justifyContent).toBe("center");
    expect(getComputedStyle(activeItem!).textAlign).toBe("center");
    expect(getComputedStyle(activeItem!).overflowWrap).toBe("anywhere");
  });

  it("should prevent brand content from overlapping centered routes", async () => {
    setViewport(390);

    route("/docs", () => (
      <div style={{ width: "390px" }}>
        <Navbar aria-label="App navigation">
          <NavBrand asChild>
            <Link href="/">
              <span aria-hidden="true">◆</span>
              <span>Destroyer</span>
            </Link>
          </NavBrand>
          <NavGroup>
            <NavLink href="/docs" match="exact">
              Overview
            </NavLink>
            <NavLink href="/docs/about">About</NavLink>
            <NavLink href="/docs/contact">Contact</NavLink>
          </NavGroup>
          <NavGroup align="end">
            <button data-slot="button">Theme</button>
          </NavGroup>
        </Navbar>
      </div>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const brand = container?.querySelector('[data-slot="nav-brand"]') as HTMLElement | null;
    const primaryGroup = container?.querySelector(
      '[data-slot="navbar"] > [data-slot="nav-group"]:not([data-align="end"])',
    ) as HTMLElement | null;
    const brandRect = brand!.getBoundingClientRect();
    const primaryRect = primaryGroup!.getBoundingClientRect();

    expect(brandRect.right).toBeLessThanOrEqual(primaryRect.left);
    expect(getComputedStyle(brand!).overflow).toBe("hidden");
  });

  it("should switches responsive navbar between collapsed and inline content", async () => {
    const ResponsiveNav = () => (
      <Navbar aria-label="Responsive docs navigation" collapseAt="md">
        <NavBrand asChild>
          <Link href="/">Askr</Link>
        </NavBrand>
        <NavLink href="/docs" match="exact">
          Overview
        </NavLink>
        <NavLink href="/docs/components">Components</NavLink>
      </Navbar>
    );

    route("/docs", () => (
      <>
        <ResponsiveNav />
        <div id="page">Docs</div>
      </>
    ));
    route("/docs/components", () => (
      <>
        <ResponsiveNav />
        <div id="page">Components</div>
      </>
    ));
    route("/", () => (
      <>
        <ResponsiveNav />
        <div id="page">Home</div>
      </>
    ));

    setViewport(375);
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const navbar = container?.querySelector('[data-slot="navbar"]') as HTMLElement | null;
    const brand = container?.querySelector('[data-slot="nav-brand"]') as HTMLElement | null;
    const collapse = container?.querySelector(
      '[data-slot="navbar-collapse"]',
    ) as HTMLDetailsElement | null;
    const content = container?.querySelector('[data-slot="navbar-content"]') as HTMLElement | null;
    const toggle = container?.querySelector('[data-slot="navbar-toggle"]') as HTMLElement | null;

    expect(navbar?.getAttribute("data-collapse-at")).toBe("md");
    expect(brand?.textContent).toBe("Askr");
    expect(collapse).not.toBeNull();
    expect(content?.querySelector('[data-slot="nav-brand"]')).toBeNull();
    expect(getComputedStyle(brand!).display).not.toBe("none");
    expect(getComputedStyle(content!).display).toBe("none");
    expect(getComputedStyle(toggle!).display).not.toBe("none");

    toggle?.click();
    await settle();

    const menuLink = content?.querySelector(
      'a[href="/docs/components"]',
    ) as HTMLAnchorElement | null;

    expect(collapse?.hasAttribute("open")).toBe(true);
    expect(getComputedStyle(content!).display).toBe("flex");
    expect(content?.textContent).toContain("Components");
    menuLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );
    await settle();

    expect(window.location.pathname).toBe("/docs/components");
    expect(container?.querySelector('[data-slot="navbar-collapse"]')?.hasAttribute("open")).toBe(
      false,
    );

    expect(container?.querySelector('[data-slot="navbar"]')?.getAttribute("data-collapse-at")).toBe(
      "md",
    );
  });

  it("should opens NavDropdown with route-aware NavLink children", async () => {
    route("/docs", () => (
      <Navbar aria-label="Dropdown docs navigation">
        <NavBrand as="a" href="/">
          Askr
        </NavBrand>
        <NavDropdown label="More">
          <DropdownItem asChild>
            <NavLink href="/docs/components">Components</NavLink>
          </DropdownItem>
        </NavDropdown>
      </Navbar>
    ));
    route("/docs/components", () => <div id="page">Components</div>);

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const trigger = container?.querySelector(
      '[data-slot="nav-dropdown-trigger"]',
    ) as HTMLButtonElement | null;
    trigger?.click();
    await settle();

    const dropdown = document.body.querySelector(
      '[data-slot="nav-dropdown-content"]',
    ) as HTMLElement | null;
    const link = dropdown?.querySelector('a[href="/docs/components"]') as HTMLAnchorElement | null;

    expect(dropdown?.textContent).toContain("Components");
    expect(link?.getAttribute("role")).toBe("menuitem");
  });
});
