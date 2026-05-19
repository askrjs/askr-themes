import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { NavItem, NavLink } from "../../src/navs";

type ElementLike = {
  props: Record<string, unknown>;
};

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function shell(page: string) {
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
  route("/", () => shell("Home page"));
  route("/docs", () => shell("Docs home"));
  route("/docs/getting-started", () => shell("Getting started"));
  route("/docs/components", () => shell("Components"));
}

describe("navbar link jsdom regression", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
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

  it("marks the exact current route active", async () => {
    window.history.replaceState({}, "", "/docs");
    registerNavRoutes();

    await createSPA({ root: container!, manifest: getManifest() });
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

  it("keeps parent NavLink active on child routes by default", async () => {
    window.history.replaceState({}, "", "/docs/getting-started");
    registerNavRoutes();

    await createSPA({ root: container!, manifest: getManifest() });
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

  it("supports exact and prefix matching in the same nav", async () => {
    window.history.replaceState({}, "", "/docs/components");
    registerNavRoutes();

    await createSPA({ root: container!, manifest: getManifest() });
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

  it("preserves custom click handlers before client-side navigation", async () => {
    let clicks = 0;

    window.history.replaceState({}, "", "/");
    route("/", () => (
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
    route("/docs", () => <div id="page">Docs page</div>);

    await createSPA({ root: container!, manifest: getManifest() });
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

  it("leaves external links to native browser navigation", async () => {
    let wasDefaultPreventedByNavLink: boolean | undefined;

    window.history.replaceState({}, "", "/");
    route("/", () => (
      <nav aria-label="Primary">
        <NavLink href="https://example.com/docs">External docs</NavLink>
      </nav>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
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

  it("leaves same-page hash links to native browser navigation", async () => {
    let wasDefaultPreventedByNavLink: boolean | undefined;

    window.history.replaceState({}, "", "/docs");
    route("/docs", () => (
      <nav aria-label="Primary">
        <NavLink href="#api">API</NavLink>
      </nav>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
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

  it("keeps route matching props off plain NavItem anchors", () => {
    const item = NavItem({
      href: "/docs",
      children: "Docs",
      match: "exact",
    } as Parameters<typeof NavItem>[0] & { match: string }) as ElementLike;

    expect(item.props.match).toBeUndefined();
    expect(item.props.href).toBe("/docs");
  });
});
