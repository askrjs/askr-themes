import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, group, route } from "@askrjs/askr/router";

import { NavLink, Navbar } from "../../src/navs";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("navbar link browser smoke", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.history.replaceState({}, "", "/");
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

  it("should updates active NavLink state across client-side navigation inside a persistent layout", async () => {
    function DocsLayout({ children }: { children?: unknown }) {
      return (
        <>
          <Navbar aria-label="Docs">
            <NavLink href="/docs" match="exact">
              Overview
            </NavLink>
            <NavLink href="/docs/about">About</NavLink>
          </Navbar>
          <div id="page">{children}</div>
        </>
      );
    }

    group({ layout: DocsLayout }, () => {
      route("/docs", () => "Docs home");
      route("/docs/about", () => "Docs about");
    });

    window.history.replaceState({}, "", "/docs");

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    let overviewLink = container?.querySelector('a[href="/docs"]') as HTMLAnchorElement | null;
    let aboutLink = container?.querySelector('a[href="/docs/about"]') as HTMLAnchorElement | null;

    expect(overviewLink?.getAttribute("aria-current")).toBe("page");
    expect(aboutLink?.getAttribute("aria-current")).toBeNull();
    expect(aboutLink?.tagName).toBe("A");
    expect(aboutLink?.classList.contains("navbar-item")).toBe(true);
    expect(aboutLink?.getAttribute("href")).toBe("/docs/about");

    aboutLink?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );

    await settle();

    overviewLink = container?.querySelector('a[href="/docs"]') as HTMLAnchorElement | null;
    aboutLink = container?.querySelector('a[href="/docs/about"]') as HTMLAnchorElement | null;

    expect(container?.querySelector("#page")?.textContent).toBe("Docs about");
    expect(window.location.pathname).toBe("/docs/about");
    expect(overviewLink?.getAttribute("aria-current")).toBeNull();
    expect(aboutLink?.getAttribute("aria-current")).toBe("page");
  });
});
