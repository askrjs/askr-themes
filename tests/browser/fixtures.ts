import { basename } from "node:path";

import { type Locator, type Page, test as base, expect } from "@playwright/test";

export const HARNESS_URL = "/tests/browser/harness.html";

interface HarnessWindow {
  askrHarness: {
    mount(file: string, name: string, options: unknown): Promise<null>;
    run(name: string, args: unknown[]): Promise<unknown>;
    teardown(): void;
  };
}

/**
 * Mounts a scenario exported by `tests/browser/scenarios/<spec name>.tsx`.
 * `name` selects the export (default: `default`); `"<module>#<export>"` reaches
 * a shared scenario module instead of the one named after the spec.
 *
 * Named `render` rather than `mount` on purpose: Playwright reserves `mount`
 * for its own component-testing fixture, and reusing the name makes
 * `base.extend` reject this signature.
 */
export type Render = (name?: string, options?: unknown) => Promise<void>;

/** Invokes a control returned by the mounted scenario and yields its result. */
export type Run = <T = unknown>(control: string, ...args: unknown[]) => Promise<T>;

interface Fixtures {
  /**
   * Loads the harness page (once per test) and mounts a scenario into a fresh
   * `#mount-root`. Defaults to the scenario module's `default` export.
   */
  render: Render;
  /**
   * Renders raw markup into `#mount-root` with the default theme stylesheet
   * loaded — the shape most theme/CSS-variable contracts assert against.
   */
  markup: (html: string) => Promise<void>;
  /** Calls a control exposed by the scenario currently mounted. */
  run: Run;
  /** The `#mount-root` element the active scenario rendered into. */
  root: Locator;
}

async function openHarness(page: Page): Promise<void> {
  if (new URL(page.url(), "http://127.0.0.1").pathname === HARNESS_URL) return;
  await page.goto(HARNESS_URL);
  await page.waitForFunction(() => "askrHarness" in window);
}

export const test = base.extend<Fixtures>({
  render: async ({ page }, use, testInfo) => {
    const specModule = basename(testInfo.file).replace(/\.spec\.ts$/u, "");
    await use(async (name = "default", options?: unknown) => {
      const [file, exportName = "default"] = name.includes("#")
        ? name.split("#")
        : [specModule, name];
      await openHarness(page);
      await page.evaluate(
        ([scenarioFile, scenarioName, scenarioOptions]) =>
          (window as unknown as HarnessWindow).askrHarness.mount(
            scenarioFile as string,
            scenarioName as string,
            scenarioOptions,
          ),
        [file, exportName, options ?? null] as const,
      );
    });
  },

  markup: async ({ render }, use) => {
    await use(async (html: string) => {
      await render("_markup#default", { html });
    });
  },

  run: async ({ page }, use) => {
    await use((async (control: string, ...args: unknown[]) =>
      page.evaluate(
        ([name, callArgs]) =>
          (window as unknown as HarnessWindow).askrHarness.run(
            name as string,
            callArgs as unknown[],
          ),
        [control, args] as const,
      )) as Run);
  },

  root: async ({ page }, use) => {
    await use(page.locator("#mount-root"));
  },
});

export { expect };
export type { Locator, Page } from "@playwright/test";
