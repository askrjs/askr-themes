// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { EmptyState, FormSection, PageHeader, SettingsSection } from "../src/components";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("scaffold slot contract", () => {
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

  it("emits canonical data-slot hooks alongside ergonomic classes", async () => {
    route("/example", () => (
      <div class="dashboard-page">
        <PageHeader
          eyebrow="Overview"
          title="Dashboard"
          description="Operational status"
          meta="Updated now"
          actions={<button type="button">Refresh</button>}
        />
        <EmptyState
          icon={<span>!</span>}
          title="No results"
          description="Try changing the current filters."
          actions={<button type="button">Reset</button>}
        />
        <FormSection
          title="Profile"
          description="Visible to your workspace members."
          actions={<button type="button">Save</button>}
        >
          <input type="text" value="Acme" />
        </FormSection>
        <SettingsSection title="Notifications" description="Delivery preferences.">
          <input type="checkbox" checked />
        </SettingsSection>
      </div>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const pageHeader = container?.querySelector('[data-slot="page-header"]') as HTMLElement | null;
    const emptyState = container?.querySelector('[data-slot="empty-state"]') as HTMLElement | null;
    const formSection = container?.querySelector('[data-slot="form-section"]') as HTMLElement | null;
    const settingsSection = container?.querySelector(
      '[data-slot="settings-section"]'
    ) as HTMLElement | null;

    expect(pageHeader?.classList.contains("page-header")).toBe(true);
    expect(
      container?.querySelector('[data-slot="page-header-content"]')?.classList.contains(
        "page-header-content"
      )
    ).toBe(true);
    expect(
      container?.querySelector('[data-slot="page-header-actions"]')?.classList.contains(
        "page-header-actions"
      )
    ).toBe(true);

    expect(emptyState?.classList.contains("empty-state")).toBe(true);
    expect(
      container?.querySelector('[data-slot="empty-state-description"]')?.classList.contains(
        "empty-state-description"
      )
    ).toBe(true);

    expect(formSection?.classList.contains("form-section")).toBe(true);
    expect(
      container?.querySelector('[data-slot="form-section-content"]')?.classList.contains(
        "form-section-content"
      )
    ).toBe(true);

    expect(settingsSection?.classList.contains("settings-section")).toBe(true);
    expect(
      container?.querySelector('[data-slot="settings-section-copy"]')?.classList.contains(
        "settings-section-copy"
      )
    ).toBe(true);
  });
});