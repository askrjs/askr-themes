import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@askrjs/ui";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

let innerWidthSpy: { mockReturnValue(value: number): unknown } | undefined;
let innerHeightSpy: { mockReturnValue(value: number): unknown } | undefined;

function setViewport(width: number, height: number): void {
  if (typeof window.resizeTo === "function") {
    try {
      window.resizeTo(width, height);
    } catch {
      // Ignore; some runtimes expose resizeTo but block it.
    }
  }

  try {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: width,
      writable: true,
    });
  } catch {
    // Ignore if innerWidth is not configurable in this runtime.
  }

  try {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: height,
      writable: true,
    });
  } catch {
    // Ignore if innerHeight is not configurable in this runtime.
  }

  innerWidthSpy?.mockReturnValue(width);
  innerHeightSpy?.mockReturnValue(height);
  window.dispatchEvent(new Event("resize"));
}

async function waitForElement<T extends Element>(
  read: () => T | null,
  attempts = 24,
): Promise<T | null> {
  for (let index = 0; index < attempts; index += 1) {
    const element = read();
    if (element) {
      return element;
    }

    await settle();
  }

  return null;
}

async function waitForAnimationsToFinish(element: Element): Promise<void> {
  if (typeof element.getAnimations === "function") {
    const animations = element.getAnimations();
    if (animations.length > 0) {
      await Promise.allSettled(animations.map((animation) => animation.finished));
    }
  }

  await settle();
}

function assertWithinViewportPadding(content: HTMLElement, padding: number): void {
  const rect = content.getBoundingClientRect();

  expect(rect.left).toBeGreaterThanOrEqual(padding);
  expect(rect.right).toBeLessThanOrEqual(window.innerWidth - padding);
  expect(rect.width).toBeLessThanOrEqual(window.innerWidth - padding * 2);
  expect(rect.top).toBeGreaterThanOrEqual(padding);
  expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight - padding);
}

describe("dialog theme overflow regression", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    clearRoutes();
    innerWidthSpy = vi.spyOn(window, "innerWidth", "get");
    innerHeightSpy = vi.spyOn(window, "innerHeight", "get");
    innerWidthSpy.mockReturnValue(1200);
    innerHeightSpy.mockReturnValue(900);
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
    innerWidthSpy = undefined;
    innerHeightSpy = undefined;
  });

  it("should keep themed Dialog content inside viewport padding at 390 x 844", async () => {
    window.history.replaceState({}, "", "/dialog-theme");

    route("/dialog-theme", () => (
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent style={{ width: "40rem", height: "900px" }}>
            <DialogTitle>Add blob</DialogTitle>
            <DialogDescription>
              A deliberately oversized dialog surface to verify centered viewport clamping.
            </DialogDescription>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    ));

    setViewport(390, 844);
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const trigger = container?.querySelector(
      '[aria-haspopup="dialog"]',
    ) as HTMLButtonElement | null;
    trigger?.click();

    const content = await waitForElement(
      () => document.body.querySelector('[data-slot="dialog-content"]') as HTMLElement | null,
    );

    expect(content).not.toBeNull();
    await waitForAnimationsToFinish(content as HTMLElement);
    assertWithinViewportPadding(content as HTMLElement, 20);
  });

  it("should keep themed AlertDialog content inside viewport padding at 390 x 844", async () => {
    window.history.replaceState({}, "", "/alert-dialog-theme");

    route("/alert-dialog-theme", () => (
      <AlertDialog>
        <AlertDialogTrigger>Open alert</AlertDialogTrigger>
        <AlertDialogPortal>
          <AlertDialogOverlay />
          <AlertDialogContent style={{ width: "40rem", height: "900px" }}>
            <AlertDialogTitle>Delete blob?</AlertDialogTitle>
            <AlertDialogDescription>
              A deliberately oversized alert surface to verify centered viewport clamping.
            </AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    ));

    setViewport(390, 844);
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const trigger = container?.querySelector(
      '[aria-haspopup="dialog"]',
    ) as HTMLButtonElement | null;
    trigger?.click();

    const content = await waitForElement(
      () => document.body.querySelector('[data-slot="dialog-content"]') as HTMLElement | null,
    );

    expect(content).not.toBeNull();
    await waitForAnimationsToFinish(content as HTMLElement);
    assertWithinViewportPadding(content as HTMLElement, 20);
  });
});
