import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, group, route } from "@askrjs/askr/router";

import {
  DEFAULT_THEME_OPTIONS,
  ThemePicker,
  ThemeProvider,
  ThemeToggle,
  useTheme,
} from "../../src/theme";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function clearStoredThemes(): void {
  const storage = window.localStorage as
    | { removeItem?: (key: string) => void }
    | Record<string, unknown>;

  if (typeof storage.removeItem === "function") {
    storage.removeItem("askr-theme");
    storage.removeItem("askr-theme-nested");
    return;
  }

  delete storage["askr-theme"];
  delete storage["askr-theme-nested"];
}

function ThemeProbe(): JSX.Element {
  const theme = useTheme();

  return (
    <div
      data-slot="theme-probe"
      data-storage-key={theme.storageKey}
      data-theme={theme.theme()}
      data-themes={theme.themes.map((option) => option.value).join(",")}
    />
  );
}

describe("theme contracts", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.history.replaceState({}, "", "/theme");
    clearStoredThemes();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-choice");
    clearRoutes();
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
    clearStoredThemes();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-choice");
  });

  it("exposes the default theme options and provider hook state", async () => {
    expect(DEFAULT_THEME_OPTIONS).toEqual([
      { value: "system", label: "System" },
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
    ]);

    const AppLayout = ({ children }: { children?: unknown }) => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme">
        <header>
          <ThemePicker />
          <ThemeToggle />
          <ThemeProbe />
        </header>
        <main>{children}</main>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Theme</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const probe = container?.querySelector('[data-slot="theme-probe"]') as HTMLElement | null;
    const picker = container?.querySelector(
      '[data-slot="theme-picker"]',
    ) as HTMLSelectElement | null;
    const toggle = container?.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(probe?.getAttribute("data-theme")).toBe("light");
    expect(probe?.getAttribute("data-storage-key")).toBe("askr-theme");
    expect(probe?.getAttribute("data-themes")).toBe("system,light,dark");
    expect(picker?.options).toHaveLength(3);
    expect(Array.from(picker?.options ?? []).map((option) => option.value)).toEqual([
      "system",
      "light",
      "dark",
    ]);
    expect(Array.from(picker?.options ?? []).map((option) => option.text)).toEqual([
      "System",
      "Light",
      "Dark",
    ]);
    expect(toggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("light");

    toggle?.click();
    await settle();

    const probeAfter = container?.querySelector('[data-slot="theme-probe"]') as HTMLElement | null;
    const toggleAfter = container?.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(probeAfter?.getAttribute("data-theme")).toBe("dark");
    expect(toggleAfter?.getAttribute("data-theme-choice")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("dark");
  });
});
