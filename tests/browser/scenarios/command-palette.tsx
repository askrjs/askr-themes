import { state } from "@askrjs/askr";

import {
  CommandHeader,
  CommandInput,
  CommandPalette,
  CommandPaletteContent,
  CommandPaletteLink,
  CommandPaletteList,
  CommandPaletteTrigger,
} from "../../../src/components";
import { mountRoute, mountRoutes } from "./_spa";

import "../../../src/themes/default/index.css";

function PaletteContent(props: {
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  linkHref?: string;
  onBeforeNavigate?: (event: Event) => void;
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

/** Trigger-opened palette used for the dialog semantics and focus-trap case. */
export async function dialogSemantics(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/docs", () => (
    <CommandPalette>
      <CommandPaletteTrigger>Search docs</CommandPaletteTrigger>
      <PaletteContent />
    </CommandPalette>
  ));
}

/**
 * Controlled palette with no trigger. The spec drives `open` through the
 * `setOpen` control, which stands in for the original's captured `open.set`.
 */
export async function programmaticOpen(root: HTMLElement) {
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

  await mountRoute(root, "/docs", Fixture);

  return {
    setOpen: (open: boolean) => {
      setPaletteOpen?.(open);
    },
  };
}

/** Palette opened by default with both dismissal affordances turned off. */
export async function dismissalDisabled(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/docs", () => (
    <CommandPalette defaultOpen>
      <PaletteContent closeOnBackdrop={false} closeOnEscape={false} />
    </CommandPalette>
  ));
}

/** Palette opened by default, measured against narrow and wide viewports. */
export async function viewportBounds(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/docs", () => (
    <CommandPalette defaultOpen>
      <PaletteContent />
    </CommandPalette>
  ));
}

/**
 * Controlled palette that records its open/close/cleanup ordering, plus whether
 * the navigation target rendered while the palette already read as closed.
 */
export async function cleanupBeforeNavigate(root: HTMLElement) {
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

  await mountRoutes(
    root,
    {
      "/docs": Fixture,
      "/guide": () => {
        targetObservedClosed = readOpen?.() === false;
        return <main>Guide</main>;
      },
    },
    "/docs",
  );

  return {
    events: () => events,
    targetObservedClosed: () => targetObservedClosed,
  };
}

/**
 * Palette whose `onBeforeNavigate` cancels the activation. The original used a
 * `vi.fn` spy; the call count is kept browser-side and read through `calls`.
 */
export async function cancelNavigate(root: HTMLElement) {
  let calls = 0;
  const onBeforeNavigate = (event: Event) => {
    calls += 1;
    event.preventDefault();
  };

  await mountRoutes(
    root,
    {
      "/docs": () => (
        <CommandPalette defaultOpen>
          <PaletteContent onBeforeNavigate={onBeforeNavigate} linkHref="/guide" />
        </CommandPalette>
      ),
      "/guide": () => <main>Guide</main>,
    },
    "/docs",
  );

  return { calls: () => calls };
}
