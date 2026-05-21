import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, group, navigate, route } from "@askrjs/askr/router";

import { CAT_THEME_NAMES, CAT_THEME_OPTIONS, ThemeProvider, ThemeToggle } from "../../src/theme";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
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
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-choice");
  });

  it("preserves theme state across navigation and repeated toggles", async () => {
    const AppLayout = ({ children }: { children?: unknown }) => (
      <ThemeProvider defaultTheme="light">
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

    expect(container.querySelector('[data-slot="theme-provider"]')).not.toBeNull();
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme-choice")).toBeNull();

    await settle();

    const toggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;
    const html = document.documentElement;

    expect(container.querySelector('[data-slot="theme-provider"]')).not.toBeNull();
    expect(toggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(html.getAttribute("data-theme")).toBe("light");
    expect(html.getAttribute("data-theme-choice")).toBe("light");

    toggle?.click();
    await settle();

    const darkToggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(darkToggle?.getAttribute("data-theme-choice")).toBe("dark");
    expect(darkToggle?.getAttribute("data-next-theme")).toBe("light");
    expect(html.getAttribute("data-theme")).toBe("dark");
    expect(html.getAttribute("data-theme-choice")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");

    navigate("/about");
    await settle();

    const afterNavigateToggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(container.querySelector("#page")?.textContent).toBe("About");
    expect(afterNavigateToggle?.getAttribute("data-theme-choice")).toBe("dark");
    expect(html.getAttribute("data-theme")).toBe("dark");
    expect(html.getAttribute("data-theme-choice")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");

    afterNavigateToggle?.click();
    await settle();

    const lightToggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(lightToggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(lightToggle?.getAttribute("data-next-theme")).toBe("dark");
    expect(html.getAttribute("data-theme")).toBe("light");
    expect(html.getAttribute("data-theme-choice")).toBe("light");
    expect(window.localStorage.getItem("askr-theme")).toBe("light");
  });

  it("preserves cat preset theme state across navigation and repeated toggles", async () => {
    const AppLayout = ({ children }: { children?: unknown }) => (
      <ThemeProvider defaultTheme="tabby" themes={CAT_THEME_OPTIONS}>
        <header>
          <ThemeToggle themes={CAT_THEME_NAMES}>{({ nextTheme }) => nextTheme}</ThemeToggle>
        </header>
        <main>{children}</main>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/example", () => <div id="page">Example</div>);
      route("/about", () => <div id="page">About</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });

    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme-choice")).toBeNull();

    await settle();

    const toggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;
    const html = document.documentElement;

    expect(toggle?.getAttribute("data-theme-choice")).toBe("tabby");
    expect(toggle?.getAttribute("data-next-theme")).toBe("ginger");
    expect(toggle?.textContent).toBe("ginger");
    expect(html.getAttribute("data-theme")).toBe("tabby");
    expect(html.getAttribute("data-theme-choice")).toBe("tabby");

    toggle?.click();
    await settle();

    const gingerToggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(gingerToggle?.getAttribute("data-theme-choice")).toBe("ginger");
    expect(gingerToggle?.getAttribute("data-next-theme")).toBe("tuxedo");
    expect(gingerToggle?.textContent).toBe("tuxedo");
    expect(html.getAttribute("data-theme")).toBe("ginger");
    expect(html.getAttribute("data-theme-choice")).toBe("ginger");
    expect(window.localStorage.getItem("askr-theme")).toBe("ginger");

    navigate("/about");
    await settle();

    const afterNavigateToggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(container.querySelector("#page")?.textContent).toBe("About");
    expect(afterNavigateToggle?.getAttribute("data-theme-choice")).toBe("ginger");
    expect(afterNavigateToggle?.getAttribute("data-next-theme")).toBe("tuxedo");
    expect(afterNavigateToggle?.textContent).toBe("tuxedo");
    expect(html.getAttribute("data-theme")).toBe("ginger");
    expect(html.getAttribute("data-theme-choice")).toBe("ginger");
    expect(window.localStorage.getItem("askr-theme")).toBe("ginger");
  });
});
