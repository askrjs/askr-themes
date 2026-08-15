import { page, userEvent } from "@vitest/browser/context";
import { state } from "@askrjs/askr";
import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import {
  CommandHeader,
  CommandInput,
  CommandPalette,
  CommandPaletteContent,
  CommandPaletteLink,
  CommandPaletteList,
  CommandPaletteTrigger,
} from "../../src/components";
import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

async function waitForElement<T extends Element>(read: () => T | null): Promise<T> {
  const deadline = performance.now() + 5_000;

  do {
    const element = read();
    if (element) return element;
    await settle();
    await new Promise((resolve) => setTimeout(resolve, 25));
  } while (performance.now() < deadline);

  throw new Error("Expected command palette element to mount");
}

function PaletteContent(props: {
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  linkHref?: string;
  onBeforeNavigate?: () => void;
}) {
  return (
    <CommandPaletteContent
      closeOnBackdrop={props.closeOnBackdrop}
      closeOnEscape={props.closeOnEscape}
      description="Search every documentation page"
      title="Search documentation"
    >
      <CommandHeader>
        <CommandInput aria-label="Search documentation" />
      </CommandHeader>
      <CommandPaletteList>
        <CommandPaletteLink
          href={props.linkHref ?? "/guide"}
          onBeforeNavigate={props.onBeforeNavigate}
        >
          Getting started
        </CommandPaletteLink>
      </CommandPaletteList>
    </CommandPaletteContent>
  );
}

describe("CommandPalette", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.history.replaceState({}, "", "/docs");
    resetTestRoutes();
  });

  afterEach(async () => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    resetTestRoutes();
    await page.viewport(1280, 900);
  });

  it("should wire dialog semantics, contain focus, and restore the trigger", async () => {
    testRoute("/docs", () => (
      <CommandPalette>
        <CommandPaletteTrigger>Search docs</CommandPaletteTrigger>
        <PaletteContent />
      </CommandPalette>
    ));

    await createSPA({ root: container!, registry: createTestRegistry() });
    const trigger = container!.querySelector("button") as HTMLButtonElement;
    await userEvent.click(trigger);

    const dialog = await waitForElement(
      () => document.body.querySelector('[role="dialog"]') as HTMLElement | null,
    );
    const input = dialog.querySelector("input") as HTMLInputElement;
    const link = dialog.querySelector("a") as HTMLAnchorElement;

    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    expect(link.getAttribute("role")).toBeNull();
    expect(link.parentElement?.tagName).toBe("LI");
    expect(link.parentElement?.parentElement?.tagName).toBe("UL");
    expect(document.activeElement).toBe(input);

    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await waitForElement(() => {
      const currentLink = document.body.querySelector('[role="dialog"] a');
      return currentLink && document.activeElement === currentLink ? currentLink : null;
    });
    const currentLink = document.body.querySelector('[role="dialog"] a') as HTMLAnchorElement;
    currentLink.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }),
    );
    await waitForElement(() => {
      const currentInput = document.body.querySelector('[role="dialog"] input');
      return currentInput && document.activeElement === currentInput ? currentInput : null;
    });

    await userEvent.keyboard("{Escape}");
    await settle();

    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    const keyboardTrigger = container!.querySelector("button") as HTMLButtonElement;
    keyboardTrigger.focus();
    await userEvent.keyboard("{Enter}");
    const keyboardInput = await waitForElement(
      () => document.body.querySelector('[role="dialog"] input') as HTMLInputElement | null,
    );
    expect(document.activeElement).toBe(keyboardInput);
    await userEvent.keyboard("{Escape}");
    await settle();
    expect(document.activeElement).toBe(keyboardTrigger);
  });

  it("should focus and restore the active element for programmatic opens", async () => {
    let setPaletteOpen: ((open: boolean) => void) | undefined;

    function Fixture() {
      const open = state(false);
      setPaletteOpen = open.set;
      return (
        <div>
          <button type="button">Outside control</button>
          <CommandPalette open={open()} onOpenChange={open.set}>
            <PaletteContent />
          </CommandPalette>
        </div>
      );
    }

    testRoute("/docs", Fixture);
    await createSPA({ root: container!, registry: createTestRegistry() });

    const outside = container!.querySelector("button") as HTMLButtonElement;
    outside.focus();
    setPaletteOpen?.(true);
    const input = await waitForElement(
      () => document.body.querySelector('[role="dialog"] input') as HTMLInputElement | null,
    );

    expect(document.activeElement).toBe(input);
    setPaletteOpen?.(false);
    await settle();

    expect(document.activeElement).toBe(outside);
  });

  it("should allow Escape and backdrop dismissal to be disabled explicitly", async () => {
    testRoute("/docs", () => (
      <CommandPalette defaultOpen>
        <PaletteContent closeOnBackdrop={false} closeOnEscape={false} />
      </CommandPalette>
    ));

    await createSPA({ root: container!, registry: createTestRegistry() });
    const dialog = await waitForElement(
      () => document.body.querySelector('[role="dialog"]') as HTMLElement | null,
    );
    dialog.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Escape" }),
    );
    await settle();
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();

    const overlay = document.body.querySelector("[data-command-palette-overlay]") as HTMLElement;
    overlay.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    await settle();
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it("should keep the palette inside narrow mobile and desktop viewports", async () => {
    testRoute("/docs", () => (
      <CommandPalette defaultOpen>
        <PaletteContent />
      </CommandPalette>
    ));

    await page.viewport(390, 844);
    await createSPA({ root: container!, registry: createTestRegistry() });
    const content = await waitForElement(
      () => document.body.querySelector("[data-command-palette-content]") as HTMLElement | null,
    );

    const mobileRect = content.getBoundingClientRect();
    expect(mobileRect.left).toBeGreaterThanOrEqual(8);
    expect(mobileRect.right).toBeLessThanOrEqual(382);
    expect(mobileRect.top).toBeGreaterThanOrEqual(8);
    expect(mobileRect.bottom).toBeLessThanOrEqual(836);

    await page.viewport(1280, 900);
    await settle();
    const desktopRect = content.getBoundingClientRect();
    expect(desktopRect.width).toBeLessThanOrEqual(672);
    expect(desktopRect.right).toBeLessThanOrEqual(1272);
    expect(desktopRect.bottom).toBeLessThanOrEqual(892);
  });

  it("should run cleanup and close before same-origin result navigation", async () => {
    const events: string[] = [];
    let readOpen: (() => boolean) | undefined;
    let targetObservedClosed = false;

    function Fixture() {
      const open = state(false);
      readOpen = open;
      return (
        <CommandPalette
          open={open()}
          onOpenChange={(nextOpen) => {
            events.push(nextOpen ? "open" : "close");
            open.set(nextOpen);
          }}
        >
          <CommandPaletteTrigger>Search docs</CommandPaletteTrigger>
          <PaletteContent onBeforeNavigate={() => events.push("cleanup")} linkHref="/guide" />
        </CommandPalette>
      );
    }

    testRoute("/docs", Fixture);
    testRoute("/guide", () => {
      targetObservedClosed = readOpen?.() === false;
      return <main>Guide</main>;
    });

    await createSPA({ root: container!, registry: createTestRegistry() });
    (container!.querySelector("button") as HTMLButtonElement).click();
    const link = await waitForElement(
      () => document.body.querySelector('[data-slot="command-item"]') as HTMLAnchorElement | null,
    );
    link.click();
    await settle();
    await settle();

    expect(events).toEqual(["open", "cleanup", "close"]);
    expect(targetObservedClosed).toBe(true);
    expect(window.location.pathname).toBe("/guide");
    expect(container!.textContent).toContain("Guide");
  });
});
