import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { Portal } from "@askrjs/askr/foundations";

import { Toast, ToastHost, ToastTitle, ToastViewport } from "../../src/components";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

function waitForScheduler(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 20));
}

describe("themed Toast and default Portal", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    resetTestRoutes();
    window.history.replaceState({}, "", "/toast-portal");
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    resetTestRoutes();
  });

  it("should mount a closed Toast beside portaled content without an update loop", async () => {
    testRoute("/toast-portal", () => (
      <ToastHost>
        <Portal>
          <div>Sidebar content</div>
        </Portal>
        <ToastViewport />
        <Toast open={false}>
          <ToastTitle>Validation result</ToastTitle>
        </Toast>
      </ToastHost>
    ));

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();
    await waitForScheduler();

    expect(document.body.textContent).toContain("Sidebar content");
    expect(document.body.querySelector('[data-slot="toast"]')).toBeNull();
  });
});
