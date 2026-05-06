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
    const shell = (page: string) => (
      <>
        <nav aria-label="Primary">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>
        <div id="page">{page}</div>
      </>
    );

    route("/", () => shell("Home page"));

    route("/about", () => shell("About page"));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const aboutLink = container?.querySelector('a[href="/about"]') as HTMLAnchorElement | null;

    expect(aboutLink?.tagName).toBe("A");
    expect(aboutLink?.classList.contains("navbar-item")).toBe(true);
    expect(aboutLink?.getAttribute("href")).toBe("/about");

    aboutLink?.dispatchEvent(
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
