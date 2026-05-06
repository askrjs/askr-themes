import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { NavLink } from "../src/components";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function shell(page: string) {
  return (
    <>
      <nav aria-label="Primary">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/docs">Docs</NavLink>
        <NavLink href="/docs/getting-started">Getting started</NavLink>
      </nav>
      <div id="page">{page}</div>
    </>
  );
}

function registerNavRoutes(): void {
  route("/", () => shell("Home page"));
  route("/docs", () => shell("Docs home"));
  route("/docs/getting-started", () => shell("Getting started"));
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

  it("keeps parent NavLink active on child routes", async () => {
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
    expect(docsLink?.getAttribute("aria-current")).toBe("page");
    expect(docsLink?.getAttribute("data-active")).toBe("true");
    expect(childLink?.getAttribute("aria-current")).toBe("page");
    expect(childLink?.getAttribute("data-active")).toBe("true");
  });
});
