import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { EmptyState } from "../../src/core";
import { Tab, Tabs } from "../../src/navs";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("empty state slot contract", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
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
  });

  it("should emits canonical data-slot hooks for common composition", async () => {
    route("/example", () => (
      <div class="dashboard-page">
        <EmptyState
          icon={<span>!</span>}
          title="No results"
          description="Try changing the current filters."
          action={<button type="button">Reset</button>}
        />
        <Tabs aria-label="Resources">
          <Tab href="https://github.com/askrjs" aria-label="GitHub repository">
            <span data-slot="icon">GH</span>
          </Tab>
        </Tabs>
      </div>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const emptyState = container?.querySelector('[data-slot="empty-state"]') as HTMLElement | null;
    const nav = container?.querySelector('[data-slot="tabs"]') as HTMLElement | null;
    const tab = container?.querySelector('[data-slot="tab"]') as HTMLElement | null;

    expect(emptyState).not.toBeNull();
    expect(container?.querySelector('[data-slot="empty-state-description"]')?.textContent).toBe(
      "Try changing the current filters.",
    );
    expect(container?.querySelector('[data-slot="empty-state-icon"]')?.textContent).toBe("!");
    expect(container?.querySelector('[data-slot="empty-state-actions"]')?.textContent).toBe(
      "Reset",
    );

    expect(nav).not.toBeNull();
    expect(tab).not.toBeNull();
    expect(tab?.getAttribute("href")).toBe("https://github.com/askrjs");
    expect(tab?.querySelector('[data-slot="icon"]')?.textContent).toBe("GH");
  });
});
