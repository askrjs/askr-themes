import { cleanupApp, hydrateSPA } from "@askrjs/askr/boot";
import { createRouteRegistry, route } from "@askrjs/askr/router";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Block, Container } from "../../src/core";

type ElementLike = {
  props: Record<string, unknown>;
};

type LayoutShiftEntry = PerformanceEntry & {
  hadRecentInput: boolean;
  sources?: Array<{ node?: Node }>;
  value: number;
};

const roots: HTMLElement[] = [];

async function nextPaint(): Promise<void> {
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    cleanupApp(root);
    root.remove();
  }
  for (const registry of document.querySelectorAll("style[data-askr-style-registry]")) {
    registry.remove();
  }
});

describe("generated theme style geometry", () => {
  it("should keep a centered max-width Container stable through hydration", async () => {
    for (const registry of document.querySelectorAll("style[data-askr-style-registry]")) {
      registry.remove();
    }

    const serverElement = Block({
      maxWidth: "xl",
      marginX: "auto",
      paddingX: "page",
      width: "full",
      class: "fixture",
      "data-slot": "container",
      children: "content",
    }) as unknown as ElementLike;
    const className = String(serverElement.props.class);
    const serverRegistry = document.querySelector<HTMLStyleElement>(
      "style[data-askr-style-registry]",
    );
    expect(serverRegistry).not.toBeNull();
    serverRegistry!.remove();
    document.head.append(serverRegistry!);

    const root = document.createElement("div");
    root.style.width = "1400px";
    root.innerHTML = `<div class="${className}" data-slot="container" data-ak-layout="true">content</div>`;
    document.body.append(root);
    roots.push(root);
    window.history.replaceState({}, "", "/");
    await nextPaint();

    const fixture = root.querySelector<HTMLElement>(".fixture");
    const rootBefore = root.getBoundingClientRect();
    const before = fixture!.getBoundingClientRect();
    const shifts: LayoutShiftEntry[] = [];
    const observer =
      PerformanceObserver.supportedEntryTypes?.includes("layout-shift") === true
        ? new PerformanceObserver((list) => {
            shifts.push(...(list.getEntries() as LayoutShiftEntry[]));
          })
        : undefined;
    observer?.observe({ type: "layout-shift", buffered: false });

    const registry = createRouteRegistry(() => {
      route("/", () => (
        <Container size="xl" class="fixture">
          content
        </Container>
      ));
    });
    await hydrateSPA({
      root,
      registry,
      hydrate: { verifyMarkup: true },
    });
    await nextPaint();
    shifts.push(...((observer?.takeRecords() ?? []) as LayoutShiftEntry[]));
    observer?.disconnect();

    const after = root.querySelector<HTMLElement>(".fixture")!.getBoundingClientRect();
    const fixtureShifts = shifts.filter((entry) =>
      entry.sources?.some(({ node }) => Boolean(node && root.contains(node))),
    );

    expect(Math.round(before.width)).toBe(1152);
    expect(Math.round(before.x - rootBefore.x)).toBe(124);
    expect(after.width).toBeCloseTo(before.width, 3);
    expect(after.x).toBeCloseTo(before.x, 3);
    expect(fixtureShifts.reduce((total, entry) => total + entry.value, 0)).toBe(0);
    expect(document.querySelectorAll("style[data-askr-style-registry]")).toHaveLength(1);
  });
});
