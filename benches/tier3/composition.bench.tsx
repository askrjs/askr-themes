import { afterEach, beforeEach, bench, describe, expect } from "vite-plus/test";

import { group, route, clearRoutes } from "@askrjs/askr/router";

import { mountScenario, settle, stubViewport, type MountedScenario } from "../_shared/dom";
import {
  NavbarStaticLayout,
  SidebarBenchLayout,
  ThemeBenchLayout,
} from "../_shared/fixtures";
import { consume } from "../_shared/sink";

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
});
