import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { EmptyState } from "../../src/feedback";
import { Nav, NavItem } from "../../src/navs";

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

  it("should emits canonical data-slot hooks alongside ergonomic classes", async () => {
    route("/example", () => (
      <div class="dashboard-page">
        <EmptyState
          icon={<span>!</span>}
          title="No results"
          description="Try changing the current filters."
          actions={<button type="button">Reset</button>}
        />
        <Nav aria-label="Resources">
          <NavItem href="https://github.com/askrjs" aria-label="GitHub repository" variant="icon">
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

    expect(emptyState?.classList.contains("empty-state")).toBe(true);
    expect(
      container
        ?.querySelector('[data-slot="empty-state-description"]')
        ?.classList.contains("empty-state-description"),
    ).toBe(true);

    expect(nav?.classList.contains("nav")).toBe(true);
    expect(nav?.getAttribute("data-orientation")).toBe("horizontal");
    expect(navItem?.classList.contains("navbar-item")).toBe(true);
    expect(navItem?.classList.contains("nav-item")).toBe(true);
    expect(navItem?.classList.contains("navbar-item-icon")).toBe(true);
    expect(navItem?.classList.contains("nav-item-icon")).toBe(true);
  });
});
