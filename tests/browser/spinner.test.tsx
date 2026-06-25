import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

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

  it("should renders spinner sizing", async () => {
    route("/status", () => (
      <div>
        <Spinner label="Syncing" />
      </div>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const spinner = container?.querySelector('[data-slot="progress-circle"]') as HTMLElement | null;

    expect(spinner?.getAttribute("aria-label")).toBe("Syncing");
    expect(spinner?.getAttribute("data-state")).toBe("indeterminate");
    expect(getComputedStyle(spinner!).inlineSize).toBe("36px");
    expect(getComputedStyle(spinner!).blockSize).toBe("36px");
  });
});
