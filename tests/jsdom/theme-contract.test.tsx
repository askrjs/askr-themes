import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, group, route } from "@askrjs/askr/router";

import {
  CAT_THEME_NAMES,
  CAT_THEME_OPTIONS,
  DEFAULT_THEME_OPTIONS,
  type ThemeName,
  ThemePicker,
  ThemeProvider,
  ThemeToggle,
  useTheme,
} from "../../src/theme";

const THEME_STORAGE_KEYS = [
  "",
  "askr-theme",
  "askr-theme-custom",
  "askr-theme-empty",
  "askr-theme-nested",
  "askr-theme-blocked",
  "askr-theme-remount-first",
  "askr-theme-remount-second",
] as const;

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function clearStoredThemes(): void {
  const storage = window.localStorage as
    | { removeItem?: (key: string) => void }
    | Record<string, unknown>
    | undefined;

  if (!storage) {
    return;
  }

  if (typeof storage.removeItem === "function") {
    for (const key of THEME_STORAGE_KEYS) {
      storage.removeItem(key);
    }
    return;
  }

  for (const key of THEME_STORAGE_KEYS) {
    delete storage[key];
  }
}

function changePicker(
  picker: HTMLSelectElement | null,
  value: ThemeName,
  eventInit?: { source?: "option" },
): void {
  expect(picker).not.toBeNull();
  picker!.value = value;

  if (eventInit?.source === "option") {
    const option = Array.from(picker!.options).find((item) => item.value === value);
    expect(option).not.toBeNull();
    option!.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  picker!.dispatchEvent(new Event("change", { bubbles: true }));
}

function replaceLocalStorage(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
): void {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
}

function themeIcon(name: string): JSX.Element {
  return <svg aria-hidden="true" data-icon={name} viewBox="0 0 16 16" />;
}

function ThemeIconToggle(props: { label: string }): JSX.Element {
  return (
    <ThemeToggle
      aria-label={props.label}
      lightIcon={themeIcon("sun")}
      darkIcon={themeIcon("moon")}
    />
  );
}

function ThemeSetButton(props: { label: string; theme: ThemeName }): JSX.Element {
  const theme = useTheme();

  return (
    <button
      aria-label={props.label}
      onClick={() => {
        theme.setTheme(props.theme);
      }}
    />
  );
}

function ThemeProbe(props: { id?: string } = {}): JSX.Element {
  const theme = useTheme();

  return (
    <div
      data-slot="theme-probe"
      data-probe-id={props.id}
      data-storage-key={theme.storageKey}
      data-theme={theme.theme()}
      data-themes={theme.themes.map((option) => option.value).join(",")}
    />
  );
}

function getThemeIcon(label: string): string | null {
  return document
    .querySelector(`[aria-label="${label}"] svg`)
    ?.getAttribute("data-icon") ?? null;
}

function getSelectedValues(picker: HTMLSelectElement | null): string[] {
  return Array.from(picker?.options ?? [])
    .filter((option) => option.selected)
    .map((option) => option.value);
}

describe("theme contracts", () => {
  let container: HTMLDivElement | undefined;
  let restoreLocalStorage: (() => void) | undefined;

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
    restoreLocalStorage?.();
    restoreLocalStorage = undefined;
    clearStoredThemes();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-choice");
  });

  it("should exposes the default theme options and provider hook state", async () => {
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

  it("should exposes cat preset options for provider and picker composition", async () => {
    expect(CAT_THEME_NAMES).toEqual(["tabby", "ginger", "tuxedo", "calico", "torty"]);
    expect(CAT_THEME_OPTIONS).toEqual([
      { value: "tabby", label: "Tabby" },
      { value: "ginger", label: "Ginger" },
      { value: "tuxedo", label: "Tuxedo" },
      { value: "calico", label: "Calico" },
      { value: "torty", label: "Torty" },
    ]);

    const AppLayout = ({ children }: { children?: unknown }) => (
      <ThemeProvider
        defaultTheme="tabby"
        storageKey="askr-theme"
        themes={[...DEFAULT_THEME_OPTIONS, ...CAT_THEME_OPTIONS]}
      >
        <ThemePicker />
        <ThemeToggle themes={CAT_THEME_NAMES} />
        <ThemeProbe />
        {children}
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Cat themes</div>);
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

    expect(probe?.getAttribute("data-theme")).toBe("tabby");
    expect(probe?.getAttribute("data-themes")).toBe(
      "system,light,dark,tabby,ginger,tuxedo,calico,torty",
    );
    expect(Array.from(picker?.options ?? []).map((option) => option.value)).toEqual([
      "system",
      "light",
      "dark",
      "tabby",
      "ginger",
      "tuxedo",
      "calico",
      "torty",
    ]);
    expect(document.documentElement.getAttribute("data-theme")).toBe("tabby");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("tabby");
    expect(toggle?.getAttribute("data-next-theme")).toBe("ginger");

    toggle?.click();
    await settle();

    expect(document.documentElement.getAttribute("data-theme")).toBe("ginger");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("ginger");
  });

  it("should prefer stored themes and let the picker switch back to system mode", async () => {
    window.localStorage.setItem("askr-theme", "dark");

    const AppLayout = () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme">
        <ThemePicker />
        <ThemeToggle />
        <ThemeProbe />
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Stored theme</div>);
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

    expect(probe?.getAttribute("data-theme")).toBe("dark");
    expect(picker?.value).toBe("dark");
    expect(toggle?.getAttribute("data-theme-choice")).toBe("dark");
    expect(toggle?.getAttribute("data-next-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("dark");

    changePicker(picker, "system");
    await settle();

    const probeAfter = container?.querySelector('[data-slot="theme-probe"]') as HTMLElement | null;
    const toggleAfter = container?.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(probeAfter?.getAttribute("data-theme")).toBe("system");
    expect(picker?.value).toBe("system");
    expect(toggleAfter?.getAttribute("data-theme-choice")).toBe("system");
    expect(toggleAfter?.getAttribute("data-next-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("system");
    expect(window.localStorage.getItem("askr-theme")).toBe("system");
  });

  it("should isolate custom storage keys from the default theme key", async () => {
    window.localStorage.setItem("askr-theme", "dark");

    const AppLayout = () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme-custom">
        <ThemeToggle />
        <ThemeProbe />
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Custom storage</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const probe = container?.querySelector('[data-slot="theme-probe"]') as HTMLElement | null;
    const toggle = container?.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(probe?.getAttribute("data-storage-key")).toBe("askr-theme-custom");
    expect(probe?.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme-custom")).toBeNull();

    toggle?.click();
    await settle();

    expect(window.localStorage.getItem("askr-theme")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme-custom")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("dark");
  });

  it("should keep provider state usable when storage reads and writes fail", async () => {
    const originalLocalStorage = window.localStorage;
    replaceLocalStorage({
      getItem() {
        throw new Error("blocked read");
      },
      setItem() {
        throw new Error("blocked write");
      },
      removeItem() {
        throw new Error("blocked remove");
      },
    });
    restoreLocalStorage = () => replaceLocalStorage(originalLocalStorage);

    const AppLayout = () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme-blocked">
        <ThemeToggle />
        <ThemeProbe />
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Blocked storage</div>);
    });

    await expect(createSPA({ root: container!, manifest: getManifest() })).resolves.toBeUndefined();
    await settle();

    const getProbe = () =>
      container?.querySelector('[data-slot="theme-probe"]') as HTMLElement | null;
    const getToggle = () =>
      container?.querySelector('[data-theme-control="toggle"]') as HTMLButtonElement | null;

    expect(getProbe()?.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("light");

    getToggle()?.click();
    await settle();

    expect(getProbe()?.getAttribute("data-theme")).toBe("dark");
    expect(getToggle()?.getAttribute("data-theme-choice")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("dark");
  });

  it("should isolate nested provider context while root theme follows the latest change", async () => {
    const AppLayout = () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme">
        <ThemePicker label="Outer theme" />
        <ThemeToggle aria-label="Outer toggle" />
        <ThemeProbe id="outer" />
        <ThemeProvider
          defaultTheme="tabby"
          storageKey="askr-theme-nested"
          themes={CAT_THEME_OPTIONS}
        >
          <ThemePicker label="Inner theme" />
          <ThemeToggle aria-label="Inner toggle" themes={CAT_THEME_NAMES} />
          <ThemeProbe id="inner" />
        </ThemeProvider>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Nested themes</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const getOuterProbe = () =>
      container?.querySelector('[data-probe-id="outer"]') as HTMLElement | null;
    const getInnerProbe = () =>
      container?.querySelector('[data-probe-id="inner"]') as HTMLElement | null;
    const outerToggle = container?.querySelector(
      '[aria-label="Outer toggle"]',
    ) as HTMLButtonElement | null;
    const innerPicker = container?.querySelector(
      '[aria-label="Inner theme"]',
    ) as HTMLSelectElement | null;

    expect(getOuterProbe()?.getAttribute("data-theme")).toBe("light");
    expect(getInnerProbe()?.getAttribute("data-theme")).toBe("tabby");
    expect(document.documentElement.getAttribute("data-theme")).toBe("tabby");

    outerToggle?.click();
    await settle();

    expect(getOuterProbe()?.getAttribute("data-theme")).toBe("dark");
    expect(getInnerProbe()?.getAttribute("data-theme")).toBe("tabby");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme-nested")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("dark");

    changePicker(innerPicker, "calico");
    await settle();

    expect(getOuterProbe()?.getAttribute("data-theme")).toBe("dark");
    expect(getInnerProbe()?.getAttribute("data-theme")).toBe("calico");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme-nested")).toBe("calico");
    expect(document.documentElement.getAttribute("data-theme")).toBe("calico");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("calico");
  });

  it("should keep toggle icons synchronized with stored and picker-driven theme changes", async () => {
    window.localStorage.setItem("askr-theme", "dark");

    const AppLayout = () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme">
        <ThemePicker />
        <ThemeIconToggle label="Icon toggle" />
        <ThemeProbe />
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Icon theme</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const picker = container?.querySelector(
      '[data-slot="theme-picker"]',
    ) as HTMLSelectElement | null;

    expect(getThemeIcon("Icon toggle")).toBe("moon");
    expect(picker?.value).toBe("dark");
    expect(getSelectedValues(picker)).toEqual(["dark"]);

    changePicker(picker, "light");
    await settle();

    expect(getThemeIcon("Icon toggle")).toBe("sun");
    expect(picker?.value).toBe("light");
    expect(getSelectedValues(picker)).toEqual(["light"]);

    changePicker(picker, "dark");
    await settle();

    expect(getThemeIcon("Icon toggle")).toBe("moon");
    expect(picker?.value).toBe("dark");
    expect(getSelectedValues(picker)).toEqual(["dark"]);

    changePicker(picker, "system");
    await settle();

    expect(getThemeIcon("Icon toggle")).toBe("sun");
    expect(picker?.value).toBe("system");
    expect(getSelectedValues(picker)).toEqual(["system"]);
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("system");
  });

  it("should keep toggle icons synchronized with direct provider state updates", async () => {
    const AppLayout = () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme">
        <ThemeIconToggle label="Icon toggle" />
        <ThemeSetButton label="Set dark" theme="dark" />
        <ThemeSetButton label="Set system" theme="system" />
        <ThemeSetButton label="Set light" theme="light" />
        <ThemeProbe />
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Direct theme</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const click = (label: string) => {
      const button = container?.querySelector(`[aria-label="${label}"]`) as HTMLButtonElement | null;
      expect(button).not.toBeNull();
      button!.click();
    };

    expect(getThemeIcon("Icon toggle")).toBe("sun");

    click("Set dark");
    await settle();

    expect(getThemeIcon("Icon toggle")).toBe("moon");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");

    click("Set system");
    await settle();

    expect(getThemeIcon("Icon toggle")).toBe("sun");
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("system");

    click("Set light");
    await settle();

    expect(getThemeIcon("Icon toggle")).toBe("sun");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("should isolate nested provider toggle icons when an inner picker changes", async () => {
    const AppLayout = () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme">
        <ThemeIconToggle label="Outer icon toggle" />
        <ThemeProvider defaultTheme="light" storageKey="askr-theme-nested">
          <ThemePicker label="Inner theme" />
          <ThemeIconToggle label="Inner icon toggle" />
        </ThemeProvider>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Nested icons</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const innerPicker = container?.querySelector(
      '[aria-label="Inner theme"]',
    ) as HTMLSelectElement | null;

    expect(getThemeIcon("Outer icon toggle")).toBe("sun");
    expect(getThemeIcon("Inner icon toggle")).toBe("sun");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    changePicker(innerPicker, "dark");
    await settle();

    expect(getThemeIcon("Outer icon toggle")).toBe("sun");
    expect(getThemeIcon("Inner icon toggle")).toBe("moon");
    expect(window.localStorage.getItem("askr-theme")).toBeNull();
    expect(window.localStorage.getItem("askr-theme-nested")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    changePicker(innerPicker, "system");
    await settle();

    expect(getThemeIcon("Outer icon toggle")).toBe("sun");
    expect(getThemeIcon("Inner icon toggle")).toBe("sun");
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("system");
  });

  it("should let a fresh app mount replace a previous explicit root theme", async () => {
    const FirstApp = () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme-remount-first">
        <ThemeToggle />
      </ThemeProvider>
    );

    group({ layout: FirstApp }, () => {
      route("/theme", () => <div id="page">First app</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const firstToggle = container?.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;
    firstToggle?.click();
    await settle();

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    cleanupApp(container!);
    container!.replaceChildren();
    clearRoutes();
    window.history.replaceState({}, "", "/theme");

    const SecondApp = () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme-remount-second">
        <ThemeProbe />
      </ThemeProvider>
    );

    group({ layout: SecondApp }, () => {
      route("/theme", () => <div id="page">Second app</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const probe = container?.querySelector('[data-slot="theme-probe"]') as HTMLElement | null;

    expect(probe?.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme-choice")).toBe("light");
  });

  it("should keep empty storage keys isolated from the default storage key", async () => {
    window.localStorage.setItem("", "dark");
    window.localStorage.setItem("askr-theme", "system");

    const AppLayout = () => (
      <ThemeProvider defaultTheme="light" storageKey="">
        <ThemeIconToggle label="Icon toggle" />
        <ThemeProbe />
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Empty storage key</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const toggle = container?.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;
    const probe = container?.querySelector('[data-slot="theme-probe"]') as HTMLElement | null;

    expect(probe?.getAttribute("data-storage-key")).toBe("");
    expect(toggle?.getAttribute("data-theme-choice")).toBe("dark");
    expect(getThemeIcon("Icon toggle")).toBe("moon");
    expect(window.localStorage.getItem("askr-theme")).toBe("system");

    toggle?.click();
    await settle();

    expect(window.localStorage.getItem("")).toBe("light");
    expect(window.localStorage.getItem("askr-theme")).toBe("system");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("should fall back to the default theme when storage returns an empty theme string", async () => {
    window.localStorage.setItem("askr-theme-empty", "");

    const AppLayout = () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme-empty">
        <ThemePicker />
        <ThemeIconToggle label="Icon toggle" />
        <ThemeProbe />
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Empty stored theme</div>);
    });

    await expect(createSPA({ root: container!, manifest: getManifest() })).resolves.toBeUndefined();
    await settle();

    const toggle = container?.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;
    const picker = container?.querySelector(
      '[data-slot="theme-picker"]',
    ) as HTMLSelectElement | null;

    expect(toggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(toggle?.getAttribute("data-next-theme")).toBe("dark");
    expect(getThemeIcon("Icon toggle")).toBe("sun");
    expect(picker?.value).toBe("light");

    toggle?.click();
    await settle();

    const toggleAfter = container?.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(toggleAfter?.getAttribute("data-theme-choice")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme-empty")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("should support narrow picker options and bubbled option change events", async () => {
    const AppLayout = () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme">
        <ThemePicker label="Narrow theme" themes={[{ value: "dark", label: "Dark" }]} />
        <ThemeIconToggle label="Icon toggle" />
        <ThemeProbe />
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme", () => <div id="page">Narrow picker</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const picker = container?.querySelector(
      '[aria-label="Narrow theme"]',
    ) as HTMLSelectElement | null;

    expect(picker?.options).toHaveLength(1);
    expect(getThemeIcon("Icon toggle")).toBe("sun");

    changePicker(picker, "dark", { source: "option" });
    await settle();

    const probe = container?.querySelector('[data-slot="theme-probe"]') as HTMLElement | null;

    expect(probe?.getAttribute("data-theme")).toBe("dark");
    expect(getThemeIcon("Icon toggle")).toBe("moon");
    expect(picker?.value).toBe("dark");
    expect(getSelectedValues(picker)).toEqual(["dark"]);
  });
});
