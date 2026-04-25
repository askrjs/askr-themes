import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA, navigate } from "@askrjs/askr";
import { clearRoutes, getManifest, group, route } from "@askrjs/askr/router";

import { ThemeProvider, ThemeToggle } from "../src/components";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("theme route persistence in the browser", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.localStorage.removeItem("askr-theme");
    window.history.replaceState({}, "", "/example");
    clearRoutes();
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }
    clearRoutes();
    window.localStorage.removeItem("askr-theme");
  });

  it("preserves theme state across navigation and repeated toggles", async () => {
    const AppLayout = ({ children }: { children?: unknown }) => (
      <ThemeProvider class="app-shell" defaultTheme="light">
        <header>
          <ThemeToggle />
        </header>
        <main>{children}</main>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/example", () => <div id="page">Example</div>);
      route("/about", () => <div id="page">About</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const toggle = container.querySelector(
      '[data-theme-control="toggle"]'
    ) as HTMLButtonElement | null;
    const provider = container.querySelector(
      '[data-slot="theme-provider"]'
    ) as HTMLDivElement | null;

    expect(toggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(provider?.getAttribute("data-theme")).toBe("light");

    toggle?.click();
    await settle();

    const darkToggle = container.querySelector(
      '[data-theme-control="toggle"]'
    ) as HTMLButtonElement | null;
    const darkProvider = container.querySelector(
      '[data-slot="theme-provider"]'
    ) as HTMLDivElement | null;

    expect(darkToggle?.getAttribute("data-theme-choice")).toBe("dark");
    expect(darkToggle?.getAttribute("data-next-theme")).toBe("light");
    expect(darkProvider?.getAttribute("data-theme")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");

    navigate("/about");
    await settle();

    const afterNavigateToggle = container.querySelector(
      '[data-theme-control="toggle"]'
    ) as HTMLButtonElement | null;
    const afterNavigateProvider = container.querySelector(
      '[data-slot="theme-provider"]'
    ) as HTMLDivElement | null;

    expect(container.querySelector("#page")?.textContent).toBe("About");
    expect(afterNavigateToggle?.getAttribute("data-theme-choice")).toBe("dark");
    expect(afterNavigateProvider?.getAttribute("data-theme")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");

    afterNavigateToggle?.click();
    await settle();

    const lightToggle = container.querySelector(
      '[data-theme-control="toggle"]'
    ) as HTMLButtonElement | null;
    const lightProvider = container.querySelector(
      '[data-slot="theme-provider"]'
    ) as HTMLDivElement | null;

    expect(lightToggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(lightToggle?.getAttribute("data-next-theme")).toBe("dark");
    expect(lightProvider?.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem("askr-theme")).toBe("light");
  });
});