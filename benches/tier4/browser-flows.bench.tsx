import { afterEach, beforeEach, bench, describe, expect, vi } from "vite-plus/test";

import { state } from "@askrjs/askr";
import { group, navigate, route, clearRoutes } from "@askrjs/askr/router";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@askrjs/ui";

import "../../src/themes/default/index.css";

import { mountScenario, settle, stubViewport, type MountedScenario } from "../_shared/dom";
import {
  NavbarBenchLayout,
  SidebarBenchLayout,
  ThemeBenchLayout,
  buildPublicFamilyPage,
  buildRouteTransitionPage,
  buildTablePage,
} from "../_shared/fixtures";
import { ThemePicker, ThemeProvider, ThemeToggle } from "../../src/theme";

const LIVE_LOG_LIMIT = 32;

type LiveEntry = {
  id: number;
  label: string;
  detail: string;
};

function createLiveEntry(id: number): LiveEntry {
  return {
    id,
    label: `Row ${id + 1}`,
    detail: id % 2 === 0 ? "steady" : "updated",
  };
}

function createLiveEntries(limit: number): LiveEntry[] {
  return Array.from({ length: limit }, (_, index) => createLiveEntry(index));
}

function LiveTableLog(): JSX.Element {
  const rows = state(createLiveEntries(LIVE_LOG_LIMIT));

  const appendRow = () => {
    const currentRows = rows();
    const nextId = (currentRows.at(-1)?.id ?? -1) + 1;
    rows.set([...currentRows.slice(1), createLiveEntry(nextId)]);
  };

  return (
    <section data-bench="live-table-log">
      <button data-slot="log-append" type="button" onClick={appendRow}>
        Append
      </button>
      <Table aria-label="Live log">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Label</TableHeaderCell>
            <TableHeaderCell>Detail</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows().map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.label}</TableCell>
              <TableCell>{row.detail}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ol data-slot="live-log">
        {rows().map((row) => (
          <li key={row.id} data-row={row.id}>
            {row.label}: {row.detail}
          </li>
        ))}
      </ol>
    </section>
  );
}

function NestedThemeRoute(): JSX.Element {
  return (
    <section data-bench="nested-theme-route">
      <ThemeProvider defaultTheme="dark" storageKey="askr-theme-nested">
        <header data-bench="nested-theme-header">
          <ThemePicker label="Nested theme" />
          <ThemeToggle />
        </header>
        <div data-bench="nested-theme-body">
          {buildRouteTransitionPage({ title: "Nested theme", rows: 6 })}
        </div>
      </ThemeProvider>
    </section>
  );
}

type BrowserHeapPerformance = Performance & {
  memory?: {
    usedJSHeapSize: number;
  };
};

function readBrowserHeapUsed(): number | null {
  const usedJSHeapSize = (globalThis.performance as BrowserHeapPerformance | undefined)?.memory
    ?.usedJSHeapSize;

  return typeof usedJSHeapSize === "number" ? usedJSHeapSize : null;
}

function formatHeap(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)}MiB`;
}

let memorySoakReported = false;

describe("tier4 browser benches", () => {
  bench("public family mount", async () => {
    const scenario = await mountScenario("/families", () => {
      route("/families", () => buildPublicFamilyPage());
    });

    try {
      void scenario.container.querySelectorAll('[data-slot="icon"]').length;
      void scenario.container.querySelector('[data-slot="button-group"]');
      void scenario.container.querySelector('[data-slot="breadcrumb"]');
      void scenario.container.querySelector('[data-slot="pagination"]');
      void scenario.container.querySelector('[data-slot="card"]');
    } finally {
      scenario.cleanup();
    }
  });

  bench("table theme style read", async () => {
    const scenario = await mountScenario("/table", () => {
      route("/table", () => buildTablePage());
    });

    try {
      const table = scenario.container.querySelector(
        '[data-slot="table"]',
      ) as HTMLTableElement | null;
      const headerCell = scenario.container.querySelector(
        '[data-slot="table-header-cell"]',
      ) as HTMLTableCellElement | null;
      const bodyCell = scenario.container.querySelector(
        '[data-slot="table-cell"]',
      ) as HTMLTableCellElement | null;

      if (!table || !headerCell || !bodyCell) {
        throw new Error("table theme bench failed to mount the expected table slots");
      }

      const tableStyle = getComputedStyle(table);
      const bodyCellStyle = getComputedStyle(bodyCell);

      void tableStyle.borderRadius;
      void tableStyle.borderSpacing;
      void bodyCellStyle.paddingInlineStart;
      void headerCell.textContent;
    } finally {
      scenario.cleanup();
    }
  });

  describe("nested theme invalidation", () => {
    let scenario: MountedScenario | undefined;

    beforeEach(async () => {
      window.localStorage.removeItem("askr-theme");
      window.localStorage.removeItem("askr-theme-nested");
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("data-theme-choice");

      scenario = await mountScenario("/example", () => {
        group({ layout: ThemeBenchLayout }, () => {
          route("/example", () => <NestedThemeRoute />);
        });
      });

      expect(scenario.container.querySelector('[data-bench="nested-theme-route"]')).not.toBeNull();
    });

    afterEach(() => {
      scenario?.cleanup();
      scenario = undefined;
      clearRoutes();
      window.localStorage.removeItem("askr-theme");
      window.localStorage.removeItem("askr-theme-nested");
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("data-theme-choice");
    });

    bench("nested theme invalidation cycle", async () => {
      const outerToggle = scenario?.container.querySelector(
        '[data-bench="theme-header"] [data-theme-control="toggle"]',
      ) as HTMLButtonElement | null;
      const innerToggle = scenario?.container.querySelector(
        '[data-bench="nested-theme-header"] [data-theme-control="toggle"]',
      ) as HTMLButtonElement | null;
      const nestedBody = scenario?.container.querySelector(
        '[data-bench="nested-theme-body"]',
      ) as HTMLElement | null;

      if (!outerToggle || !innerToggle || !nestedBody) {
        throw new Error("nested theme bench failed to mount the expected controls");
      }

      outerToggle.click();
      await settle();
      void getComputedStyle(nestedBody).color;

      innerToggle.click();
      await settle();
      void getComputedStyle(nestedBody).color;

      outerToggle.click();
      await settle();
      void getComputedStyle(nestedBody).color;
    });
  });

  describe("theme persistence", () => {
    let scenario: MountedScenario | undefined;

    beforeEach(async () => {
      window.localStorage.removeItem("askr-theme");
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("data-theme-choice");

      scenario = await mountScenario("/example", () => {
        group({ layout: ThemeBenchLayout }, () => {
          route("/example", () => <div id="page">Example</div>);
          route("/about", () => <div id="page">About</div>);
        });
      });

      expect(scenario.container.querySelector('[data-slot="theme-provider"]')).not.toBeNull();
    });

    afterEach(() => {
      scenario?.cleanup();
      scenario = undefined;
      clearRoutes();
      window.localStorage.removeItem("askr-theme");
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("data-theme-choice");
    });

    bench("theme route persistence cycle", async () => {
      const toggle = scenario?.container.querySelector(
        '[data-theme-control="toggle"]',
      ) as HTMLButtonElement | null;

      if (!toggle) {
        throw new Error("theme bench failed to mount the toggle control");
      }

      toggle.click();
      await settle();

      navigate("/about");
      await settle();

      navigate("/example");
      await settle();

      const toggleAfter = scenario?.container.querySelector(
        '[data-theme-control="toggle"]',
      ) as HTMLButtonElement | null;

      toggleAfter?.click();
      await settle();
    });
  });

  describe("large route transitions", () => {
    let scenario: MountedScenario | undefined;

    beforeEach(async () => {
      scenario = await mountScenario("/docs", () => {
        group({ layout: NavbarBenchLayout }, () => {
          route("/docs", () => buildRouteTransitionPage({ title: "Docs", rows: 24 }));
          route("/docs/components", () =>
            buildRouteTransitionPage({ title: "Components", rows: 24 }),
          );
        });
      });

      expect(scenario.container.querySelector('[data-slot="navbar"]')).not.toBeNull();
    });

    afterEach(() => {
      scenario?.cleanup();
      scenario = undefined;
      clearRoutes();
    });

    bench("large route transition cycle", async () => {
      navigate("/docs/components");
      await settle();

      navigate("/docs");
      await settle();
    });
  });

  describe("navbar responsiveness", () => {
    let scenario: MountedScenario | undefined;
    let viewport: ReturnType<typeof stubViewport> | undefined;
    let warnSpy: { mockRestore(): void } | undefined;

    beforeEach(async () => {
      viewport = stubViewport(1200);
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

      scenario = await mountScenario("/docs", () => {
        group({ layout: NavbarBenchLayout }, () => {
          route("/docs", () => <div id="page">Docs home</div>);
          route("/docs/components", () => <div id="page">Components</div>);
        });
      });

      expect(scenario.container.querySelector('[data-slot="navbar"]')).not.toBeNull();
    });

    afterEach(() => {
      scenario?.cleanup();
      scenario = undefined;
      viewport?.restore();
      viewport = undefined;
      warnSpy?.mockRestore();
      warnSpy = undefined;
      clearRoutes();
    });

    bench("navbar responsive cycle", async () => {
      viewport?.set(375);
      window.dispatchEvent(new Event("resize"));
      await settle();

      const navbar = scenario?.container.querySelector(
        '[data-slot="navbar"]',
      ) as HTMLElement | null;
      const shell = scenario?.container.querySelector(
        '[data-slot="navbar-shell"]',
      ) as HTMLElement | null;
      const toggle = scenario?.container.querySelector(
        '[data-slot="navbar-toggle"]',
      ) as HTMLButtonElement | null;

      if (!navbar || !shell || !toggle) {
        throw new Error("navbar bench failed to mount the responsive chrome");
      }

      void getComputedStyle(navbar).justifyContent;
      void getComputedStyle(shell).display;

      toggle.click();
      await settle();

      const backdrop = scenario?.container.querySelector(
        '[data-slot="navbar-backdrop"]',
      ) as HTMLElement | null;

      backdrop?.click();
      await settle();

      viewport?.set(1200);
      window.dispatchEvent(new Event("resize"));
      await settle();
    });
  });

  describe("sidebar responsiveness", () => {
    let scenario: MountedScenario | undefined;
    let viewport: ReturnType<typeof stubViewport> | undefined;

    beforeEach(async () => {
      viewport = stubViewport(1200);

      scenario = await mountScenario("/docs", () => {
        group({ layout: SidebarBenchLayout }, () => {
          route("/docs", () => <div id="page">Docs content</div>);
        });
      });

      expect(scenario.container.querySelector('[data-slot="sidebar"]')).not.toBeNull();
    });

    afterEach(() => {
      scenario?.cleanup();
      scenario = undefined;
      viewport?.restore();
      viewport = undefined;
      clearRoutes();
    });

    bench("sidebar responsive cycle", async () => {
      const sidebar = scenario?.container.querySelector(
        '[data-slot="sidebar"]',
      ) as HTMLElement | null;
      const shellNav = scenario?.container.querySelector(
        '[data-slot="shell-nav"]',
      ) as HTMLElement | null;
      const railToggle = scenario?.container.querySelector(
        '[data-slot="sidebar-rail-toggle"]',
      ) as HTMLButtonElement | null;

      if (!sidebar || !shellNav || !railToggle) {
        throw new Error("sidebar bench failed to mount the responsive chrome");
      }

      void getComputedStyle(sidebar).width;
      void getComputedStyle(shellNav).width;

      railToggle.click();
      await settle();

      viewport?.set(375);
      window.dispatchEvent(new Event("resize"));
      await settle();

      const mobileToggle = scenario?.container.querySelector(
        '[data-slot="sidebar-toggle"]',
      ) as HTMLButtonElement | null;

      if (!mobileToggle) {
        throw new Error("sidebar bench failed to expose the mobile toggle");
      }

      mobileToggle.click();
      await settle();

      const panel = scenario?.container.querySelector(
        '[data-slot="sidebar-panel"]',
      ) as HTMLElement | null;
      const backdrop = scenario?.container.querySelector(
        '[data-slot="sidebar-backdrop"]',
      ) as HTMLElement | null;

      if (!panel || !backdrop) {
        throw new Error("sidebar bench failed to open the mobile panel");
      }

      void getComputedStyle(panel).display;

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await settle();

      const reopenedToggle = scenario?.container.querySelector(
        '[data-slot="sidebar-toggle"]',
      ) as HTMLButtonElement | null;

      reopenedToggle?.click();
      await settle();

      const reopenedBackdrop = scenario?.container.querySelector(
        '[data-slot="sidebar-backdrop"]',
      ) as HTMLElement | null;

      reopenedBackdrop?.click();
      await settle();

      viewport?.set(1200);
      window.dispatchEvent(new Event("resize"));
      await settle();
    });
  });

  describe("live table logs", () => {
    let scenario: MountedScenario | undefined;

    beforeEach(async () => {
      scenario = await mountScenario("/logs", () => {
        route("/logs", () => <LiveTableLog />);
      });

      expect(scenario.container.querySelector('[data-bench="live-table-log"]')).not.toBeNull();
    });

    afterEach(() => {
      scenario?.cleanup();
      scenario = undefined;
      clearRoutes();
    });

    bench("live table log append-evict cycle", async () => {
      const append = scenario?.container.querySelector(
        '[data-slot="log-append"]',
      ) as HTMLButtonElement | null;
      const table = scenario?.container.querySelector(
        '[aria-label="Live log"]',
      ) as HTMLTableElement | null;
      const log = scenario?.container.querySelector(
        '[data-slot="live-log"]',
      ) as HTMLOListElement | null;

      if (!append || !table || !log) {
        throw new Error("live table bench failed to mount the expected log controls");
      }

      for (let i = 0; i < 4; i += 1) {
        append.click();
        await settle();
        void table.querySelectorAll("tbody tr").length;
        void log.querySelectorAll("li").length;
      }
    });
  });

  describe("long-session memory", () => {
    const MEMORY_SOAK_CYCLES = 8;

    bench("shell/theme memory soak", async () => {
      const viewport = stubViewport(1200);
      const retainedHeapSamples: number[] = [];

      try {
        for (let cycle = 0; cycle < MEMORY_SOAK_CYCLES; cycle += 1) {
          window.localStorage.removeItem("askr-theme-memory-soak");
          document.documentElement.removeAttribute("data-theme");
          document.documentElement.removeAttribute("data-theme-choice");

          const scenario = await mountScenario("/docs", () => {
            group({ layout: ThemeBenchLayout }, () => {
              route("/docs", () =>
                buildRouteTransitionPage({ title: `Docs ${cycle + 1}`, rows: 18 }),
              );
            });
          });

          try {
            const themeHeader = scenario.container.querySelector(
              '[data-bench="theme-header"]',
            ) as HTMLElement | null;

            if (!themeHeader) {
              throw new Error("memory soak bench failed to mount the expected controls");
            }
          } finally {
            scenario.cleanup();
            clearRoutes();
            window.localStorage.removeItem("askr-theme-memory-soak");
            document.documentElement.removeAttribute("data-theme");
            document.documentElement.removeAttribute("data-theme-choice");
            await settle();
          }

          const heapUsed = readBrowserHeapUsed();

          if (heapUsed !== null) {
            retainedHeapSamples.push(heapUsed);
          }
        }
      } finally {
        viewport.restore();
      }

      if (retainedHeapSamples.length === 0) {
        console.info("[memory soak] performance.memory unavailable");
        return;
      }

      const baseline = retainedHeapSamples[0];
      const final = retainedHeapSamples[retainedHeapSamples.length - 1];
      const peak = retainedHeapSamples.reduce((max, sample) => Math.max(max, sample), baseline);

      if (!memorySoakReported) {
        console.info(
          `[memory soak] cycles=${MEMORY_SOAK_CYCLES} retained=${formatHeap(baseline)} -> ${formatHeap(final)} (delta ${formatHeap(final - baseline)}), peak=${formatHeap(peak)}`,
        );
        memorySoakReported = true;
      }
    });
  });
});
