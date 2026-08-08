import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { Link } from "@askrjs/askr/router";

import { Block, NavBrand, NavItem, NavLink, Navbar } from "../../src/core";
import { Pill, Tab } from "../../src/navs";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "../../src/overlays";

type ElementLike = {
  props: Record<string, unknown>;
};

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function layout(page: string) {
  return (
    <>
      <nav aria-label="Primary">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/docs" match="exact">
          Docs
        </NavLink>
        <NavLink href="/docs/getting-started">Getting started</NavLink>
        <NavLink href="/docs/components">Components</NavLink>
      </nav>
      <div id="page">{page}</div>
    </>
  );
}

function registerNavRoutes(): void {
  testRoute("/", () => layout("Home page"));
  testRoute("/docs", () => layout("Docs home"));
  testRoute("/docs/getting-started", () => layout("Getting started"));
  testRoute("/docs/components", () => layout("Components"));
}

describe("navbar link jsdom regression", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    resetTestRoutes();
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    resetTestRoutes();
  });

  it("should mark the exact current route active", async () => {
    window.history.replaceState({}, "", "/docs");
    registerNavRoutes();

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const homeLink = container?.querySelector('a[href="/"]') as HTMLAnchorElement | null;
    const docsLink = container?.querySelector('a[href="/docs"]') as HTMLAnchorElement | null;
    const childLink = container?.querySelector(
      'a[href="/docs/getting-started"]',
    ) as HTMLAnchorElement | null;

    expect(container?.querySelector("#page")?.textContent).toBe("Docs home");
    expect(homeLink?.getAttribute("aria-current")).toBeNull();
    expect(homeLink?.getAttribute("data-active")).toBeNull();
    expect(docsLink?.getAttribute("aria-current")).toBe("page");
    expect(docsLink?.getAttribute("data-active")).toBe("true");
    expect(childLink?.getAttribute("aria-current")).toBeNull();
    expect(childLink?.getAttribute("data-active")).toBeNull();
  });

  it("should support router Link as a NavBrand child", async () => {
    window.history.replaceState({}, "", "/docs");
    testRoute("/", () => <div id="page">Home page</div>);
    testRoute("/docs", () => (
      <>
        <Navbar aria-label="Primary">
          <NavBrand asChild>
            <Link href="/">Askr</Link>
          </NavBrand>
          <NavLink href="/docs" match="exact">
            Docs
          </NavLink>
        </Navbar>
        <div id="page">Docs page</div>
      </>
    ));

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const brand = container?.querySelector('[data-slot="nav-brand"]') as HTMLAnchorElement | null;

    expect(brand?.tagName).toBe("A");
    expect(brand?.getAttribute("href")).toBe("/");
    expect(brand?.textContent).toBe("Askr");

    const wasNotCancelled = brand?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );
    await settle();

    expect(wasNotCancelled).toBe(false);
    expect(window.location.pathname).toBe("/");
    expect(container?.querySelector("#page")?.textContent).toBe("Home page");
  });

  it("should keep parent NavLink active on child routes by default", async () => {
    window.history.replaceState({}, "", "/docs/getting-started");
    registerNavRoutes();

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const homeLink = container?.querySelector('a[href="/"]') as HTMLAnchorElement | null;
    const docsLink = container?.querySelector('a[href="/docs"]') as HTMLAnchorElement | null;
    const childLink = container?.querySelector(
      'a[href="/docs/getting-started"]',
    ) as HTMLAnchorElement | null;

    expect(container?.querySelector("#page")?.textContent).toBe("Getting started");
    expect(homeLink?.getAttribute("aria-current")).toBeNull();
    expect(homeLink?.getAttribute("data-active")).toBeNull();
    expect(docsLink?.getAttribute("aria-current")).toBeNull();
    expect(docsLink?.getAttribute("data-active")).toBeNull();
    expect(childLink?.getAttribute("aria-current")).toBe("page");
    expect(childLink?.getAttribute("data-active")).toBe("true");
  });

  it("should support exact and prefix matching in the same nav", async () => {
    window.history.replaceState({}, "", "/docs/components");
    registerNavRoutes();

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const docsLink = container?.querySelector('a[href="/docs"]') as HTMLAnchorElement | null;
    const componentsLink = container?.querySelector(
      'a[href="/docs/components"]',
    ) as HTMLAnchorElement | null;

    expect(container?.querySelector("#page")?.textContent).toBe("Components");
    expect(docsLink?.getAttribute("aria-current")).toBeNull();
    expect(docsLink?.getAttribute("data-active")).toBeNull();
    expect(componentsLink?.getAttribute("aria-current")).toBe("page");
    expect(componentsLink?.getAttribute("data-active")).toBe("true");
  });

  it("should preserve custom click handlers before client-side navigation", async () => {
    let clicks = 0;

    window.history.replaceState({}, "", "/");
    testRoute("/", () => (
      <>
        <nav aria-label="Primary">
          <NavLink
            href="/docs"
            onClick={() => {
              clicks += 1;
            }}
          >
            Docs
          </NavLink>
        </nav>
        <div id="page">Home page</div>
      </>
    ));
    testRoute("/docs", () => <div id="page">Docs page</div>);

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const docsLink = container?.querySelector('a[href="/docs"]') as HTMLAnchorElement | null;
    const wasNotCancelled = docsLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );

    await settle();

    expect(wasNotCancelled).toBe(false);
    expect(clicks).toBe(1);
    expect(window.location.pathname).toBe("/docs");
    expect(container?.querySelector("#page")?.textContent).toBe("Docs page");
  });

  it("should preserve the registry base path when a NavLink has a click handler", async () => {
    let clicks = 0;

    window.history.replaceState({}, "", "/website/");
    testRoute("/", () => (
      <NavLink href="/docs" onClick={() => (clicks += 1)}>
        Docs
      </NavLink>
    ));
    testRoute("/docs", () => <div id="page">Docs page</div>);

    await createSPA({ root: container!, registry: createTestRegistry({ basePath: "/website" }) });
    await settle();

    const docsLink = container?.querySelector("a") as HTMLAnchorElement | null;
    expect(docsLink?.getAttribute("href")).toBe("/website/docs");

    docsLink?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
    );
    await settle();

    expect(clicks).toBe(1);
    expect(window.location.pathname).toBe("/website/docs");
    expect(container?.querySelector("#page")?.textContent).toBe("Docs page");
  });

  it("should preserve routed link behavior for onPress, Tab, and Pill", async () => {
    let presses = 0;

    window.history.replaceState({}, "", "/website/");
    testRoute("/", () => (
      <>
        <NavLink href="/nav" onPress={() => (presses += 1)}>
          Nav
        </NavLink>
        <Tab href="/tab" onClick={(event) => event.preventDefault()}>
          Tab
        </Tab>
        <Pill href="/pill" onClick={() => undefined}>
          Pill
        </Pill>
      </>
    ));
    testRoute("/nav", () => <div id="page">Nav page</div>);
    testRoute("/tab", () => <div id="page">Tab page</div>);
    testRoute("/pill", () => <div id="page">Pill page</div>);

    await createSPA({ root: container!, registry: createTestRegistry({ basePath: "/website" }) });
    await settle();

    const links = Array.from(container!.querySelectorAll("a"));
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/website/nav",
      "/website/tab",
      "/website/pill",
    ]);

    const tabClickWasNotCancelled = links[1]?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
    );
    await settle();
    expect(tabClickWasNotCancelled).toBe(false);
    expect(window.location.pathname).toBe("/website/");

    links[0]?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
    );
    await settle();
    expect(presses).toBe(1);
    expect(window.location.pathname).toBe("/website/nav");
  });

  it("should not intercept modified clicks or explicit targets", async () => {
    window.history.replaceState({}, "", "/");
    testRoute("/", () => (
      <nav aria-label="Primary">
        <NavLink href="/docs">Docs</NavLink>
        <NavLink href="/settings" target="_blank">
          Settings
        </NavLink>
      </nav>
    ));
    testRoute("/docs", () => <div id="page">Docs page</div>);
    testRoute("/settings", () => <div id="page">Settings page</div>);

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const docsLink = container?.querySelector('a[href="/docs"]') as HTMLAnchorElement | null;
    const settingsLink = container?.querySelector(
      'a[href="/settings"]',
    ) as HTMLAnchorElement | null;

    const modifiedClickWasNotCancelled = docsLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
        metaKey: true,
      }),
    );
    const targetClickWasNotCancelled = settingsLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );

    await settle();

    expect(modifiedClickWasNotCancelled).toBe(true);
    expect(targetClickWasNotCancelled).toBe(true);
    expect(window.location.pathname).toBe("/");
  });

  it("should leave external links to native browser navigation", async () => {
    let wasDefaultPreventedByNavLink: boolean | undefined;

    window.history.replaceState({}, "", "/");
    testRoute("/", () => (
      <nav aria-label="Primary">
        <NavLink href="https://example.com/docs">External docs</NavLink>
      </nav>
    ));

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const externalLink = container?.querySelector(
      'a[href="https://example.com/docs"]',
    ) as HTMLAnchorElement | null;
    externalLink?.addEventListener(
      "click",
      (event) => {
        wasDefaultPreventedByNavLink = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true },
    );

    externalLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );

    expect(wasDefaultPreventedByNavLink).toBe(false);
    expect(window.location.pathname).toBe("/");
  });

  it("should leave same-page hash links to native browser navigation", async () => {
    let wasDefaultPreventedByNavLink: boolean | undefined;

    window.history.replaceState({}, "", "/docs");
    testRoute("/docs", () => (
      <nav aria-label="Primary">
        <NavLink href="#api">API</NavLink>
      </nav>
    ));

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const hashLink = container?.querySelector('a[href="#api"]') as HTMLAnchorElement | null;
    hashLink?.addEventListener(
      "click",
      (event) => {
        wasDefaultPreventedByNavLink = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true },
    );

    hashLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );

    expect(wasDefaultPreventedByNavLink).toBe(false);
    expect(window.location.pathname).toBe("/docs");
  });

  it("should leave same-origin downloads to native browser navigation", async () => {
    let wasDefaultPreventedByNavLink: boolean | undefined;

    window.history.replaceState({}, "", "/");
    testRoute("/", () => (
      <nav aria-label="Primary">
        <NavLink href="/exports/report.csv" download="report.csv">
          Download report
        </NavLink>
      </nav>
    ));

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const downloadLink = container?.querySelector(
      'a[href="/exports/report.csv"]',
    ) as HTMLAnchorElement | null;
    expect(downloadLink?.download).toBe("report.csv");
    downloadLink?.addEventListener(
      "click",
      (event) => {
        wasDefaultPreventedByNavLink = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true },
    );

    downloadLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );

    expect(wasDefaultPreventedByNavLink).toBe(false);
    expect(window.location.pathname).toBe("/");
  });

  it("should preserve route behavior through DropdownItem asChild with NavLink", async () => {
    window.history.replaceState({}, "", "/");
    testRoute("/", () => (
      <nav aria-label="Primary">
        <Dropdown id="route-dropdown" defaultOpen>
          <DropdownTrigger>Workspace</DropdownTrigger>
          <DropdownContent forceMount aria-label="Workspace menu">
            <DropdownItem asChild>
              <NavLink href="/docs" match="exact">
                Docs
              </NavLink>
            </DropdownItem>
            <DropdownItem>Copy link</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </nav>
    ));
    testRoute("/docs", () => <div id="page">Docs page</div>);

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const docsLink = document.body.querySelector(
      '[data-slot="dropdown-item"][href="/docs"]',
    ) as HTMLAnchorElement | null;
    const action = document.body.querySelector(
      '[data-slot="dropdown-item"]:not([href])',
    ) as HTMLButtonElement | null;

    expect(docsLink).not.toBeNull();
    expect(docsLink?.tagName).toBe("A");
    expect(docsLink?.getAttribute("role")).toBe("menuitem");
    expect(docsLink?.getAttribute("match")).toBeNull();
    expect(action?.tagName).toBe("BUTTON");

    const wasNotCancelled = docsLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );
    await settle();

    expect(wasNotCancelled).toBe(false);
    expect(window.location.pathname).toBe("/docs");
    expect(container?.querySelector("#page")?.textContent).toBe("Docs page");
  });

  it("should keep DropdownItem asChild NavLink native behavior for non-SPA link clicks", async () => {
    let externalDefaultPrevented: boolean | undefined;
    let modifiedWasNotCancelled: boolean | undefined;

    window.history.replaceState({}, "", "/");
    testRoute("/", () => (
      <nav aria-label="Primary">
        <Dropdown id="native-dropdown" defaultOpen>
          <DropdownTrigger>Workspace</DropdownTrigger>
          <DropdownContent forceMount aria-label="Workspace menu">
            <DropdownItem asChild>
              <NavLink href="/docs">Docs</NavLink>
            </DropdownItem>
            <DropdownItem asChild>
              <NavLink href="https://example.com/docs">External docs</NavLink>
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      </nav>
    ));
    testRoute("/docs", () => <div id="page">Docs page</div>);

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const docsLink = document.body.querySelector(
      '[data-slot="dropdown-item"][href="/docs"]',
    ) as HTMLAnchorElement | null;
    const externalLink = document.body.querySelector(
      '[data-slot="dropdown-item"][href="https://example.com/docs"]',
    ) as HTMLAnchorElement | null;
    externalLink?.addEventListener(
      "click",
      (event) => {
        externalDefaultPrevented = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true },
    );

    modifiedWasNotCancelled = docsLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
        metaKey: true,
      }),
    );
    externalLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );

    expect(modifiedWasNotCancelled).toBe(true);
    expect(externalDefaultPrevented).toBe(false);
    expect(window.location.pathname).toBe("/");
  });

  it("should keep route matching props off plain NavItem anchors", () => {
    const item = NavItem({
      href: "/docs",
      children: "Docs",
      match: "exact",
    } as unknown as Parameters<typeof NavItem>[0]) as ElementLike;

    expect(item.props.match).toBeUndefined();
    expect(item.props.href).toBe("/docs");
  });

  it("should pass NavItem layout props through asChild without leaking route-only props", () => {
    const item = NavItem({
      asChild: true,
      children: {
        type: "button",
        props: {
          type: "button",
          children: "Workspace",
        },
      },
      match: "exact",
      active: true,
    } as unknown as Parameters<typeof NavItem>[0]) as ElementLike;

    expect(item.props.match).toBeUndefined();
    expect(item.type).toBe(Block);
    expect(item.props["data-slot"]).toBe("nav-item");
    expect(item.props["data-active"]).toBe("true");
    expect(item.props.paddingX).toBe("sm");
    expect(item.props.paddingY).toBe("xs");
    expect(item.props.radius).toBe("md");
  });
});
