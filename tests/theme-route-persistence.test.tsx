// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA, navigate } from "@askrjs/askr";
import { clearRoutes, getManifest, group, route } from "@askrjs/askr/router";

import { ThemeProvider, ThemeToggle } from "../src/components";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function clearStoredTheme(): void {
  const storage = window.localStorage as
    | { removeItem?: (key: string) => void }
    | Record<string, unknown>;

  if (typeof storage.removeItem === "function") {
    storage.removeItem("askr-theme");
    return;
  }

  delete storage["askr-theme"];
}

describe("theme route persistence", () => {
  let container: HTMLDivElement | undefined;
  let restoreLocalStorage: (() => void) | undefined;

  beforeEach(() => {
    const values = new Map<string, string>();
    const original = window.localStorage;
    const mockStorage = {
      getItem(key: string) {
        return values.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        values.set(key, String(value));
      },
      removeItem(key: string) {
        values.delete(key);
      },
      clear() {
        values.clear();
      },
    } satisfies Pick<Storage, "getItem" | "setItem" | "removeItem" | "clear">;

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: mockStorage,
    });

    restoreLocalStorage = () => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        value: original,
      });
    };

    container = document.createElement("div");
    document.body.appendChild(container);
    clearStoredTheme();
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
    clearStoredTheme();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-choice");
    restoreLocalStorage?.();
    restoreLocalStorage = undefined;
  });

  it("preserves the active theme across route navigation", async () => {
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
    await settle();

    const toggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;
    const html = document.documentElement;

    expect(container.querySelector('[data-slot="theme-provider"]')).toBeNull();
    expect(toggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(html.getAttribute("data-theme")).toBe("light");
    expect(html.getAttribute("data-theme-choice")).toBe("light");

    toggle?.click();
    await settle();

    const toggleAfterPress = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(toggleAfterPress?.getAttribute("data-theme-choice")).toBe("dark");
    expect(toggleAfterPress?.getAttribute("data-next-theme")).toBe("light");
    expect(html.getAttribute("data-theme")).toBe("dark");
    expect(html.getAttribute("data-theme-choice")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");

    navigate("/about");
    await settle();

    const toggleAfter = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;
    const pageAfter = container.querySelector("#page");

    expect(pageAfter?.textContent).toBe("About");
    expect(toggleAfter?.getAttribute("data-theme-choice")).toBe("dark");
    expect(toggleAfter?.getAttribute("data-next-theme")).toBe("light");
    expect(html.getAttribute("data-theme")).toBe("dark");
    expect(html.getAttribute("data-theme-choice")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");
  });

  it("should replace the icon instead of accumulating icons on repeated toggles", async () => {
    const AppLayout = () => (
      <ThemeProvider defaultTheme="light">
        <ThemeToggle
          toggleThemes={["light", "dark"]}
          lightIcon={<svg aria-hidden="true" data-icon="sun" viewBox="0 0 16 16" />}
          darkIcon={<svg aria-hidden="true" data-icon="moon" viewBox="0 0 16 16" />}
        />
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/example", () => <div id="page">Example</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const getToggle = () =>
      container?.querySelector('[data-theme-control="toggle"]') as HTMLButtonElement | null;

    expect(getToggle()?.querySelectorAll("svg")).toHaveLength(1);

    getToggle()?.click();
    await settle();

    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("dark");
    expect(getToggle()?.querySelectorAll("svg")).toHaveLength(1);

    getToggle()?.click();
    await settle();

    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("light");
    expect(getToggle()?.querySelectorAll("svg")).toHaveLength(1);
  });
});
