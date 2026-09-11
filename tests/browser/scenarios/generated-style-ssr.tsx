import { hydrateSPA } from "@askrjs/askr/boot";
import { createRouteRegistry, route } from "@askrjs/askr/router";

import { Block, Container } from "../../../src/core";

type ElementLike = {
  props: Record<string, unknown>;
};

type LayoutShiftEntry = PerformanceEntry & {
  hadRecentInput: boolean;
  sources?: Array<{ node?: Node }>;
  value: number;
};

/** Geometry the spec asserts on, reduced to plain numbers. */
export interface HydrationGeometry {
  beforeWidth: number;
  beforeX: number;
  rootBeforeX: number;
  afterWidth: number;
  afterX: number;
  shiftTotal: number;
  registryCount: number;
}

async function nextPaint(): Promise<void> {
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

/**
 * Renders `Block` as a server would, hydrates the resulting markup with the
 * equivalent `Container`, and measures the layout shift across the swap. The
 * whole sequence has to stay in the browser, so the spec only sees the numbers.
 */
export default async function generatedStyleSSR(root: HTMLElement): Promise<{
  geometry: () => HydrationGeometry;
}> {
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
  if (!serverRegistry) throw new Error("Block did not emit a generated style registry");
  serverRegistry.remove();
  document.head.append(serverRegistry);

  root.style.width = "1400px";
  root.innerHTML = `<div class="${className}" data-slot="container" data-ak-layout="true">content</div>`;
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

  const measured: HydrationGeometry = {
    beforeWidth: before.width,
    beforeX: before.x,
    rootBeforeX: rootBefore.x,
    afterWidth: after.width,
    afterX: after.x,
    shiftTotal: fixtureShifts.reduce((total, entry) => total + entry.value, 0),
    registryCount: document.querySelectorAll("style[data-askr-style-registry]").length,
  };

  return { geometry: () => measured };
}
