// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { NavLink } from "../src/components";

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

  it("navigates client-side when NavLink is clicked", async () => {
    route("/", () => (
      <nav aria-label="Primary">
        <NavLink href="/about">About</NavLink>
      </nav>
    ));

    route("/about", () => <div id="page">About page</div>);

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const link = container?.querySelector('[data-slot="nav-link"]') as HTMLAnchorElement | null;

    expect(link?.tagName).toBe("A");
    expect(link?.classList.contains("navbar-item")).toBe(true);
    expect(link?.getAttribute("href")).toBe("/about");

    link?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );

    await settle();

    expect(container?.querySelector("#page")?.textContent).toBe("About page");
    expect(window.location.pathname).toBe("/about");
  });
});