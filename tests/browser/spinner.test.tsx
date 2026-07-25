import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";

import { Spinner } from "../../src/surfaces";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("spinner browser smoke", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.history.replaceState({}, "", "/status");
    resetTestRoutes();
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    resetTestRoutes();
  });

  it("should renders spinner sizing", async () => {
    testRoute("/status", () => (
      <div>
        <Spinner label="Syncing" />
      </div>
    ));

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const spinner = container?.querySelector('[data-slot="progress-circle"]') as HTMLElement | null;

    expect(spinner?.getAttribute("aria-label")).toBe("Syncing");
    expect(spinner?.getAttribute("data-state")).toBe("indeterminate");
    expect(getComputedStyle(spinner!).inlineSize).toBe("36px");
    expect(getComputedStyle(spinner!).blockSize).toBe("36px");
  });
});
