import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { EmptyState } from "../../src/feedback";
import { NavItem } from "../../src/core";
import { Nav } from "../../src/navs";

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
        <Nav aria-label="Resources">
          <NavItem href="https://github.com/askrjs" aria-label="GitHub repository">
            <span data-slot="icon">GH</span>
          </NavItem>
        </Nav>
      </div>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const emptyState = container?.querySelector('[data-slot="empty-state"]') as HTMLElement | null;
    const nav = container?.querySelector('[data-slot="nav"]') as HTMLElement | null;
    const navItem = container?.querySelector('[data-slot="nav-item"]') as HTMLElement | null;

    expect(emptyState).not.toBeNull();
    expect(
      container
        ?.querySelector('[data-slot="empty-state-description"]')
        ?.textContent,
    ).toBe("Try changing the current filters.");
    expect(container?.querySelector('[data-slot="empty-state-icon"]')?.textContent).toBe("!");
    expect(container?.querySelector('[data-slot="empty-state-actions"]')?.textContent).toBe(
      "Reset",
    );

    expect(nav).not.toBeNull();
    expect(nav?.getAttribute("data-orientation")).toBe("horizontal");
    expect(navItem).not.toBeNull();
    expect(navItem?.getAttribute("href")).toBe("https://github.com/askrjs");
    expect(navItem?.querySelector('[data-slot="icon"]')?.textContent).toBe("GH");
  });
});
