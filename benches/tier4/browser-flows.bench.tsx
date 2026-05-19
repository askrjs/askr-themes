import { afterEach, beforeEach, bench, describe, expect, vi } from "vite-plus/test";

import { group, navigate, route, clearRoutes } from "@askrjs/askr/router";

import "../../src/themes/default/index.css";

import { mountScenario, settle, stubViewport, type MountedScenario } from "../_shared/dom";
import {
  NavbarBenchLayout,
  SidebarBenchLayout,
  ThemeBenchLayout,
  buildPublicFamilyPage,
  buildTablePage,
} from "../_shared/fixtures";

describe("tier4 browser benches", () => {
  bench("public family mount", async () => {
    const scenario = await mountScenario("/families", () => {
      route("/families", () => buildPublicFamilyPage());
    });

    try {
      void scenario.container.querySelectorAll('[data-slot="icon"]').length;
      void scenario.container.querySelector('[data-slot="button-group"]');
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
      const table = scenario.container.querySelector('[data-slot="table"]') as HTMLTableElement | null;
      const headerCell = scenario.container.querySelector(
        '[data-slot="table-header-cell"]',
      ) as HTMLTableCellElement | null;
      const bodyCell = scenario.container.querySelector('[data-slot="table-cell"]') as HTMLTableCellElement | null;

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

      const navbar = scenario?.container.querySelector('[data-slot="navbar"]') as HTMLElement | null;
      const shell = scenario?.container.querySelector('[data-slot="navbar-shell"]') as HTMLElement | null;
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
      const sidebar = scenario?.container.querySelector('[data-slot="sidebar"]') as HTMLElement | null;
      const shellNav = scenario?.container.querySelector('[data-slot="shell-nav"]') as HTMLElement | null;
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

      const panel = scenario?.container.querySelector('[data-slot="sidebar-panel"]') as HTMLElement | null;
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
});
