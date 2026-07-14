import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, group, navigate, route } from "@askrjs/askr/router";

import {
  ThemePicker,
  ThemeProvider,
  ThemeToggle,
  type ThemeToggleRenderContext,
} from "../../src/theme";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
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

  it("should preserves the active theme across route navigation", async () => {
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

  it("should render one stable provider host around root synchronization and content", async () => {
    const App = () => (
      <ThemeProvider defaultTheme="light">
        <main id="provider-content">Northstar</main>
      </ThemeProvider>
    );
    route("/example", App);

    await createSPA({ root: container!, manifest: getManifest() });

    const provider = container!.querySelector('[data-slot="theme-provider"]');
    expect(container!.children).toHaveLength(1);
    expect(container!.firstElementChild).toBe(provider);
    expect(provider?.querySelector("#provider-content")?.textContent).toBe("Northstar");
  });

  it("should keep a single visible icon on repeated toggles", async () => {
    const AppLayout = () => (
      <ThemeProvider defaultTheme="light">
        <ThemeToggle
          themes={["light", "dark"]}
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
    const getIconSlots = () => getToggle()?.querySelectorAll('[data-slot="theme-toggle-icon"]');
    const getVisibleIcon = () =>
      getToggle()?.querySelector(
        '[data-slot="theme-toggle-icon"]:not([hidden]) svg',
      ) as SVGElement | null;

    expect(getIconSlots()).toHaveLength(2);
    expect(getToggle()?.querySelectorAll("svg")).toHaveLength(2);
    expect(getVisibleIcon()?.getAttribute("data-icon")).toBe("sun");

    getToggle()?.click();
    await settle();

    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("dark");
    expect(getIconSlots()).toHaveLength(2);
    expect(getToggle()?.querySelectorAll("svg")).toHaveLength(2);
    expect(getVisibleIcon()?.getAttribute("data-icon")).toBe("moon");

    getToggle()?.click();
    await settle();

    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("light");
    expect(getIconSlots()).toHaveLength(2);
    expect(getToggle()?.querySelectorAll("svg")).toHaveLength(2);
    expect(getVisibleIcon()?.getAttribute("data-icon")).toBe("sun");

    getToggle()?.click();
    await settle();

    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("dark");
    expect(getIconSlots()).toHaveLength(2);
    expect(getToggle()?.querySelectorAll("svg")).toHaveLength(2);
    expect(getVisibleIcon()?.getAttribute("data-icon")).toBe("moon");
  });

  it("should mounts theme controls without render-time state errors", async () => {
    const AppLayout = () => (
      <ThemeProvider defaultTheme="light">
        <header>
          <ThemePicker />
          <ThemeToggle />
        </header>
        <main>
          <div id="page">Example</div>
        </main>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/example", () => <div id="page">Example</div>);
    });

    await expect(createSPA({ root: container!, manifest: getManifest() })).resolves.toBeUndefined();
    await settle();

    expect(container.querySelector('[data-slot="theme-provider"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="theme-picker"]')).not.toBeNull();
    expect(container.querySelector('[data-theme-control="toggle"]')).not.toBeNull();
  });

  it("should keep multiple toggles synchronized after repeated presses", async () => {
    const renderLog: string[] = [];
    const renderLabel = ({ theme, nextTheme }: ThemeToggleRenderContext) => {
      renderLog.push(`${theme}->${nextTheme}`);
      return `${theme}->${nextTheme}`;
    };

    const AppLayout = () => (
      <ThemeProvider defaultTheme="light">
        <ThemeToggle aria-label="Icon toggle" />
        <ThemeToggle aria-label="Text toggle">{renderLabel}</ThemeToggle>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/example", () => <div id="page">Example</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const getToggles = () =>
      [...(container?.querySelectorAll('[data-theme-control="toggle"]') ?? [])] as [
        HTMLButtonElement,
        HTMLButtonElement,
      ];

    let [iconToggle, textToggle] = getToggles();

    expect(iconToggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(iconToggle?.getAttribute("data-next-theme")).toBe("dark");
    expect(textToggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(textToggle?.textContent).toBe("light->dark");

    iconToggle?.click();
    await settle();

    [iconToggle, textToggle] = getToggles();

    expect(iconToggle?.getAttribute("data-theme-choice")).toBe("dark");
    expect(iconToggle?.getAttribute("data-next-theme")).toBe("light");
    expect(textToggle?.getAttribute("data-theme-choice")).toBe("dark");
    expect(textToggle?.textContent).toBe("dark->light");

    textToggle?.click();
    await settle();

    [iconToggle, textToggle] = getToggles();

    expect(iconToggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(iconToggle?.getAttribute("data-next-theme")).toBe("dark");
    expect(textToggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(textToggle?.textContent).toBe("light->dark");
    expect(window.localStorage.getItem("askr-theme")).toBe("light");
    expect(renderLog).toContain("light->dark");
    expect(renderLog).toContain("dark->light");
  });

  it("should let onPress cancel theme changes before storage or root mutation", async () => {
    const events: string[] = [];

    const AppLayout = () => (
      <ThemeProvider defaultTheme="light">
        <ThemeToggle
          onPress={(event) => {
            events.push(
              `${document.documentElement.getAttribute("data-theme")}:${String(
                event.defaultPrevented ?? false,
              )}`,
            );
            event.preventDefault?.();
            events.push(`after:${String(event.defaultPrevented ?? false)}`);
          }}
        />
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/example", () => <div id="page">Example</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const toggle = container?.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem("askr-theme")).toBeNull();

    toggle?.click();
    await settle();

    const toggleAfter = container?.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(events).toEqual(["light:false", "after:true"]);
    expect(toggleAfter?.getAttribute("data-theme-choice")).toBe("light");
    expect(toggleAfter?.getAttribute("data-next-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("light");
    expect(window.localStorage.getItem("askr-theme")).toBeNull();
  });

  it("should treat an empty toggle cycle as a no-op", async () => {
    let pressCount = 0;

    const AppLayout = () => (
      <ThemeProvider defaultTheme="light">
        <ThemeToggle themes={[]} onPress={() => (pressCount += 1)}>
          {({ theme, nextTheme }: ThemeToggleRenderContext) => `${theme}->${nextTheme}`}
        </ThemeToggle>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/example", () => <div id="page">Example</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const getToggle = () =>
      container?.querySelector('[data-theme-control="toggle"]') as HTMLButtonElement | null;

    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("light");
    expect(getToggle()?.getAttribute("data-next-theme")).toBe("light");
    expect(getToggle()?.textContent).toBe("light->light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem("askr-theme")).toBeNull();

    getToggle()?.click();
    await settle();

    expect(pressCount).toBe(1);
    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("light");
    expect(getToggle()?.getAttribute("data-next-theme")).toBe("light");
    expect(getToggle()?.textContent).toBe("light->light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("light");
    expect(window.localStorage.getItem("askr-theme")).toBeNull();
  });

  it("should recover custom cycles when the current theme is outside the cycle", async () => {
    const AppLayout = () => (
      <ThemeProvider defaultTheme="system">
        <ThemeToggle themes={["tabby", "ginger"]}>
          {({ theme, nextTheme }: ThemeToggleRenderContext) => `${theme}->${nextTheme}`}
        </ThemeToggle>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/example", () => <div id="page">Example</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const getToggle = () =>
      container?.querySelector('[data-theme-control="toggle"]') as HTMLButtonElement | null;

    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("system");
    expect(getToggle()?.getAttribute("data-next-theme")).toBe("tabby");
    expect(getToggle()?.textContent).toBe("system->tabby");
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("system");

    getToggle()?.click();
    await settle();

    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("tabby");
    expect(getToggle()?.getAttribute("data-next-theme")).toBe("ginger");
    expect(getToggle()?.textContent).toBe("tabby->ginger");
    expect(document.documentElement.getAttribute("data-theme")).toBe("tabby");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("tabby");
    expect(window.localStorage.getItem("askr-theme")).toBe("tabby");
  });

  it("should recover stored custom themes that are outside a toggle cycle", async () => {
    window.localStorage.setItem("askr-theme", "neon");

    const AppLayout = () => (
      <ThemeProvider defaultTheme="light">
        <ThemeToggle themes={["tabby", "ginger"]}>
          {({ theme, nextTheme }: ThemeToggleRenderContext) => `${theme}->${nextTheme}`}
        </ThemeToggle>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/example", () => <div id="page">Example</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const getToggle = () =>
      container?.querySelector('[data-theme-control="toggle"]') as HTMLButtonElement | null;

    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("neon");
    expect(getToggle()?.getAttribute("data-next-theme")).toBe("tabby");
    expect(getToggle()?.textContent).toBe("neon->tabby");
    expect(document.documentElement.getAttribute("data-theme")).toBe("neon");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("neon");

    getToggle()?.click();
    await settle();

    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("tabby");
    expect(getToggle()?.getAttribute("data-next-theme")).toBe("ginger");
    expect(getToggle()?.textContent).toBe("tabby->ginger");
    expect(document.documentElement.getAttribute("data-theme")).toBe("tabby");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("tabby");
    expect(window.localStorage.getItem("askr-theme")).toBe("tabby");
  });
});
