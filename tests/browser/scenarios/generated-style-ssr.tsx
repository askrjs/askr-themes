import { cleanupApp, createIsland, hydrateSPA } from "@askrjs/askr/boot";
import { createRouteRegistry, route } from "@askrjs/askr/router";

import { Block, Container, Grid } from "../../../src/core";
import { AspectRatio, Skeleton } from "../../../src/surfaces";

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

export function pendingGeneratedStyles(root: HTMLElement, options: { detached?: boolean }) {
  const target = options?.detached ? document.createElement("div") : root;
  createIsland({
    root: target,
    component: () => (
      <section>
        {Array.from({ length: 520 }, (_, index) => (
          <Block
            key={index}
            data-generated-case={index}
            style={{ width: `${index + 1}px`, height: "2px" }}
          />
        ))}
      </section>
    ),
  });
  const beforeConnection = Array.from(
    target.querySelectorAll<HTMLElement>("[data-generated-case]"),
  ).map((node) => {
    const generated = Array.from(node.classList).find((value) => value.startsWith("ak-style-"))!;
    return (
      document
        .querySelector("style[data-askr-style-registry]")
        ?.textContent?.includes(`.${generated}{`) ?? false
    );
  });
  if (target !== root) root.append(target);
  return {
    measure: () => ({
      count: target.querySelectorAll("[data-generated-case]").length,
      availableBeforeConnection: beforeConnection.filter(Boolean).length,
      incorrectWidths: Array.from(
        target.querySelectorAll<HTMLElement>("[data-generated-case]"),
      ).flatMap((node, index) =>
        Math.abs(node.getBoundingClientRect().width - (index + 1)) < 0.1 ? [] : [index],
      ),
    }),
    dispose: () => cleanupApp(target),
  };
}

export function committedGeneratedStyles(root: HTMLElement) {
  let width = "250px";
  let reject = false;
  const notifications: Record<string, Array<number | null>> = {
    Block: [],
    Grid: [],
    AspectRatio: [],
    Skeleton: [],
  };
  const refs = Object.fromEntries(
    Object.keys(notifications).map((family) => [
      family,
      (node: HTMLElement | null) =>
        notifications[family].push(node ? Number.parseFloat(getComputedStyle(node).width) : null),
    ]),
  );
  const Rejection = () => {
    if (reject) throw Error("reject generated browser style");
    return <span />;
  };
  const Root = () => (
    <div>
      <Block ref={refs.Block} data-generated-case="Block" style={{ width }} />
      <Grid ref={refs.Grid} data-generated-case="Grid" columns={2} style={{ width }} />
      <AspectRatio
        ref={refs.AspectRatio}
        data-generated-case="AspectRatio"
        ratio={2}
        style={{ width }}
      />
      <Skeleton ref={refs.Skeleton} data-generated-case="Skeleton" width={width} />
      <Rejection />
    </div>
  );
  createIsland({ root, component: Root });
  return {
    rejectProposal: () => {
      const beforeMarkup = root.innerHTML;
      const beforeCss = document.querySelector("style[data-askr-style-registry]")?.textContent;
      width = "251px";
      reject = true;
      let rejected = false;
      try {
        createIsland({ root, component: Root });
      } catch (error) {
        rejected = error instanceof Error && error.message === "reject generated browser style";
      } finally {
        reject = false;
        width = "250px";
      }
      return {
        rejected,
        markupUnchanged: root.innerHTML === beforeMarkup,
        cssUnchanged:
          document.querySelector("style[data-askr-style-registry]")?.textContent === beforeCss,
        notifications,
      };
    },
    acceptProposal: () => {
      width = "260px";
      createIsland({ root, component: Root });
      return {
        widths: Array.from(root.querySelectorAll<HTMLElement>("[data-generated-case]")).map(
          (node) => node.getBoundingClientRect().width,
        ),
        notifications,
      };
    },
    dispose: () => {
      cleanupApp(root);
      return notifications;
    },
  };
}
