import { afterEach, beforeEach, bench, describe, expect } from "vite-plus/test";

import { group, route, navigate, clearRoutes } from "@askrjs/askr/router";

import { mountScenario, settle, stubViewport, type MountedScenario } from "../_shared/dom";
import {
  NavbarStaticLayout,
  SidebarBenchLayout,
  ThemeBenchLayout,
  buildRouteTransitionPage,
} from "../_shared/fixtures";
import { consume } from "../_shared/sink";
import {
  Header,
  NavToggle,
  Shell,
  ShellMain,
  ShellNav,
  SidebarPanel,
  SidebarToggle,
} from "../../src/shells";

describe("tier3 stateful composition benches", () => {
  describe("theme controls", () => {
    let scenario: MountedScenario | undefined;

    beforeEach(async () => {
      window.localStorage.removeItem("askr-theme");
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("data-theme-choice");

      scenario = await mountScenario("/example", () => {
        group({ layout: ThemeBenchLayout }, () => {
          route("/example", () => <div id="page">Example</div>);
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

    bench("theme toggle cycle", async () => {
      const toggle = scenario?.container.querySelector(
        '[data-theme-control="toggle"]',
      ) as HTMLButtonElement | null;

      toggle?.click();
      await settle();

      const toggleAfter = scenario?.container.querySelector(
        '[data-theme-control="toggle"]',
      ) as HTMLButtonElement | null;

      toggleAfter?.click();
      await settle();
    });

    bench("theme picker cycle", async () => {
      const picker = scenario?.container.querySelector(
        '[data-slot="theme-picker"]',
      ) as HTMLSelectElement | null;

      if (!picker) {
        return;
      }

      picker.value = "dark";
      picker.dispatchEvent(new Event("change", { bubbles: true }));
      await settle();

      const pickerAfter = scenario?.container.querySelector(
        '[data-slot="theme-picker"]',
      ) as HTMLSelectElement | null;

      pickerAfter.value = "light";
      pickerAfter.dispatchEvent(new Event("change", { bubbles: true }));
      await settle();
    });
  });

  describe("navbar shell render", () => {
    const BATCH = 64;

    bench("navbar shell render", () => {
      let result: JSX.Element | undefined;

      for (let i = 0; i < BATCH; i += 1) {
        result = NavbarStaticLayout({
          children: <div id="page">Docs home</div>,
        });
      }

      consume(result);
    });
  });

  describe("shell primitives", () => {
    const BATCH = 64;

    bench("header render", () => {
      let result: JSX.Element | undefined;

      for (let i = 0; i < BATCH; i += 1) {
        result = Header({
          children: "Docs",
          position: i % 2 === 0 ? "sticky" : "static",
        });
      }

      consume(result);
    });

    bench("navbar toggle render", () => {
      let result: JSX.Element | null | undefined;

      for (let i = 0; i < BATCH; i += 1) {
        result = NavToggle({
          active: true,
          label: "Menu",
          open: i % 2 === 0,
          panelId: "docs-navbar-panel",
          onToggle: () => undefined,
        });
      }

      consume(result);
    });

    bench("sidebar panel render", () => {
      let result: JSX.Element | null | undefined;

      for (let i = 0; i < BATCH; i += 1) {
        result = SidebarPanel({
          active: true,
          brand: <strong>Askr</strong>,
          children: <div>Docs</div>,
          collapseLabel: "Docs navigation",
          onClose: () => undefined,
          open: true,
          panelId: "docs-sidebar-panel",
        });
      }

      consume(result);
    });

    bench("sidebar toggle marker render", () => {
      let result: JSX.Element | null | undefined;

      for (let i = 0; i < BATCH; i += 1) {
        result = SidebarToggle({
          collapsedIcon: "collapsed",
          expandedIcon: "expanded",
        });
      }

      consume(result);
    });
  });

  describe("sidebar shell updates", () => {
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

    bench("sidebar rail cycle", async () => {
      const railToggle = scenario?.container.querySelector(
        '[data-slot="sidebar-rail-toggle"]',
      ) as HTMLButtonElement | null;

      railToggle?.click();
      await settle();

      const railToggleAfter = scenario?.container.querySelector(
        '[data-slot="sidebar-rail-toggle"]',
      ) as HTMLButtonElement | null;

      railToggleAfter?.click();
      await settle();
    });
  });

  describe("route transitions", () => {
    let scenario: MountedScenario | undefined;

    beforeEach(async () => {
      scenario = await mountScenario("/docs", () => {
        group({ layout: NavbarBenchLayout }, () => {
          route("/docs", () => buildRouteTransitionPage({ title: "Docs", rows: 10 }));
          route("/docs/components", () =>
            buildRouteTransitionPage({ title: "Components", rows: 10 }),
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

    bench("route transition cycle", async () => {
      navigate("/docs/components");
      await settle();

      navigate("/docs");
      await settle();
    });
  });

  describe("shell remounts", () => {
    function RemountShellLayout(props: { children?: unknown }): JSX.Element {
      const { children } = props;

      return (
        <Shell variant="topbar">
          <ShellNav>
            <div data-bench="remount-shell-nav">Docs</div>
          </ShellNav>
          <ShellMain>{children}</ShellMain>
        </Shell>
      );
    }

    bench("shell remount cycle", async () => {
      const scenario = await mountScenario("/docs", () => {
        group({ layout: RemountShellLayout }, () => {
          route("/docs", () => buildRouteTransitionPage({ title: "Docs", rows: 8 }));
        });
      });

      try {
        expect(scenario.container.querySelector('[data-slot="shell"]')).not.toBeNull();
      } finally {
        scenario.cleanup();
        clearRoutes();
        await settle();
      }
    });
  });
});
