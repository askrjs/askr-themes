import { userEvent } from "@vitest/browser/context";
import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { CopyButton } from "../../src/controls";
import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";

import "../../src/themes/default/index.css";

describe("CopyButton", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    resetTestRoutes();
    window.history.replaceState({}, "", "/copy");
  });

  afterEach(() => {
    cleanupApp(container);
    container.remove();
    resetTestRoutes();
    vi.restoreAllMocks();
  });

  it("should announce success and restore its idle state after copying", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    testRoute("/copy", () => (
      <CopyButton text="resource-123" label="Copy resource ID" resetAfter={1000} />
    ));
    await createSPA({ root: container, registry: createTestRegistry() });

    await userEvent.click(container.querySelector("button")!);
    await expect.poll(() => writeText.mock.calls.length).toBe(1);
    expect(writeText).toHaveBeenCalledWith("resource-123");
    await expect
      .poll(() => container.querySelector('[data-slot="copy-button-status"]')?.textContent)
      .toBe("Copied to clipboard.");
    expect(container.querySelector("button")?.getAttribute("data-state")).toBe("success");
    await expect
      .poll(() => container.querySelector("button")?.getAttribute("data-state"))
      .toBe("idle");
  });

  it("should announce failure when the Clipboard API is unavailable", async () => {
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    testRoute("/copy", () => <CopyButton text="resource-123" label="Copy resource ID" />);
    await createSPA({ root: container, registry: createTestRegistry() });

    await userEvent.click(container.querySelector("button")!);
    await expect
      .poll(() => container.querySelector('[data-slot="copy-button-status"]')?.textContent)
      .toBe("Could not copy to clipboard.");
    expect(container.querySelector("button")?.getAttribute("data-state")).toBe("error");
  });
});
