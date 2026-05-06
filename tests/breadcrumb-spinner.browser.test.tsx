import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Spinner,
} from "../src/components";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("breadcrumb and spinner browser smoke", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.history.replaceState({}, "", "/status");
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

  it("renders the themed breadcrumb structure and spinner sizing", async () => {
    route("/status", () => (
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbCurrent>Overview</BreadcrumbCurrent>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Spinner label="Syncing" />
      </div>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const breadcrumb = container?.querySelector('[data-slot="breadcrumb"]') as HTMLElement | null;
    const breadcrumbList = container?.querySelector(
      '[data-slot="breadcrumb-list"]',
    ) as HTMLOListElement | null;
    const breadcrumbLink = container?.querySelector(
      '[data-slot="breadcrumb-link"]',
    ) as HTMLAnchorElement | null;
    const breadcrumbCurrent = container?.querySelector(
      '[data-slot="breadcrumb-current"]',
    ) as HTMLElement | null;
    const separator = container?.querySelector(
      '[data-slot="breadcrumb-separator"]',
    ) as HTMLElement | null;
    const spinner = container?.querySelector('[data-slot="progress-circle"]') as HTMLElement | null;

    expect(breadcrumb?.getAttribute("aria-label")).toBe("Breadcrumb");
    expect(breadcrumbList?.tagName).toBe("OL");
    expect(breadcrumbLink?.tagName).toBe("A");
    expect(breadcrumbCurrent?.getAttribute("aria-current")).toBe("page");
    expect(separator?.getAttribute("aria-hidden")).toBe("true");
    expect(spinner?.getAttribute("aria-label")).toBe("Syncing");
    expect(spinner?.getAttribute("data-state")).toBe("indeterminate");
    expect(getComputedStyle(spinner!).inlineSize).toBe("36px");
    expect(getComputedStyle(spinner!).blockSize).toBe("36px");
  });
});
