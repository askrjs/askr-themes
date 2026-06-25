import { afterAll, afterEach, beforeEach, bench, describe, expect } from "vite-plus/test";

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
  Block,
  Container,
  Header,
  Main,
  Sidebar,
} from "../../src/core";

describe("tier3 stateful composition benches", () => {
  describe("theme controls", () => {
    let themeControlFailure: string | undefined;

    function failThemeControlBench(message: string): void {
      themeControlFailure ??= message;
    }

    function assertThemeState(theme: "dark" | "light"): boolean {
      const rootTheme = document.documentElement.getAttribute("data-theme");
      const rootChoice = document.documentElement.getAttribute("data-theme-choice");
      const storedTheme = window.localStorage.getItem("askr-theme");

      if (rootTheme !== theme || rootChoice !== theme || storedTheme !== theme) {
        failThemeControlBench(
          `theme bench expected ${theme}, got root=${String(rootTheme)} choice=${String(
            rootChoice,
          )} storage=${String(storedTheme)}`,
        );
        return false;
      }

      return true;
    }

    function resetThemeState(): void {
      window.localStorage.removeItem("askr-theme");
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.removeAttribute("data-theme-choice");
      clearRoutes();
    }

    async function mountThemeControlScenario(): Promise<MountedScenario | undefined> {
      resetThemeState();

      try {
        const mounted = await mountScenario("/example", () => {
          group({ layout: ThemeBenchLayout }, () => {
            route("/example", () => <div id="page">Example</div>);
          });
        });

        if (!mounted.container.querySelector('[data-slot="theme-provider"]')) {
          failThemeControlBench("theme controls bench failed to mount the expected provider");
          mounted.cleanup();
          resetThemeState();
          return undefined;
        }

        return mounted;
      } catch (error) {
        failThemeControlBench(
          `theme controls bench failed to mount: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        resetThemeState();
        return undefined;
      }
    }

    async function cleanupThemeControlScenario(mounted: MountedScenario): Promise<void> {
      mounted.cleanup();
      resetThemeState();
      await settle();
    }

    afterAll(() => {
      if (themeControlFailure) {
        throw new Error(themeControlFailure);
      }
    });

    bench("theme toggle cycle", async () => {
      const scenario = await mountThemeControlScenario();

      if (!scenario) {
        return;
      }

      try {
        const toggle = scenario?.container.querySelector(
          '[data-theme-control="toggle"]',
        ) as HTMLButtonElement | null;

        if (!toggle) {
          failThemeControlBench("theme toggle bench failed to mount the expected toggle");
          return;
        }

        toggle.click();
        await settle();

        const toggleAfter = scenario?.container.querySelector(
          '[data-theme-control="toggle"]',
        ) as HTMLButtonElement | null;

        if (!toggleAfter) {
          failThemeControlBench("theme toggle bench failed to retain the expected toggle");
          return;
        }

        if (toggleAfter.getAttribute("data-theme-choice") !== "dark") {
          failThemeControlBench("theme toggle bench failed to update the toggle to dark");
          return;
        }
        if (!assertThemeState("dark")) {
          return;
        }

        toggleAfter.click();
        await settle();

        const toggleFinal = scenario?.container.querySelector(
          '[data-theme-control="toggle"]',
        ) as HTMLButtonElement | null;

        if (!toggleFinal) {
          failThemeControlBench("theme toggle bench failed to retain the expected toggle");
          return;
        }

        if (toggleFinal.getAttribute("data-theme-choice") !== "light") {
          failThemeControlBench("theme toggle bench failed to update the toggle to light");
          return;
        }
        assertThemeState("light");
      } finally {
        await cleanupThemeControlScenario(scenario);
      }
    });

    bench("theme picker cycle", async () => {
      const scenario = await mountThemeControlScenario();

      if (!scenario) {
        return;
      }

      try {
        const picker = scenario?.container.querySelector(
          '[data-slot="theme-picker"]',
        ) as HTMLSelectElement | null;

        if (!picker) {
          failThemeControlBench("theme picker bench failed to mount the expected picker");
          return;
        }

        picker.value = "dark";
        picker.dispatchEvent(new Event("change", { bubbles: true }));
        await settle();

        const pickerAfter = scenario?.container.querySelector(
          '[data-slot="theme-picker"]',
        ) as HTMLSelectElement | null;

        if (!pickerAfter) {
          failThemeControlBench("theme picker bench failed to retain the expected picker");
          return;
        }

        if (pickerAfter.value !== "dark") {
          failThemeControlBench("theme picker bench failed to update the picker to dark");
          return;
        }
        if (!assertThemeState("dark")) {
          return;
        }

        pickerAfter.value = "light";
        pickerAfter.dispatchEvent(new Event("change", { bubbles: true }));
        await settle();

        const pickerFinal = scenario?.container.querySelector(
          '[data-slot="theme-picker"]',
        ) as HTMLSelectElement | null;

        if (!pickerFinal) {
          failThemeControlBench("theme picker bench failed to retain the expected picker");
          return;
        }

        if (pickerFinal.value !== "light") {
          failThemeControlBench("theme picker bench failed to update the picker to light");
          return;
        }
        assertThemeState("light");
      } finally {
        await cleanupThemeControlScenario(scenario);
      }
    });
  });

  describe("navbar render", () => {
    const BATCH = 64;

    bench("navbar render", () => {
      let result: JSX.Element | undefined;

      for (let i = 0; i < BATCH; i += 1) {
        result = NavbarStaticLayout({
          children: <div id="page">Docs home</div>,
        });
      }

      consume(result);
    });
  });

  describe("structural presets", () => {
    const BATCH = 64;

    bench("header render", () => {
      let result: JSX.Element | undefined;

      for (let i = 0; i < BATCH; i += 1) {
        result = Header({
          children: "Docs",
          sticky: i % 2 === 0,
        });
      }

      consume(result);
    });

    bench("sidebar render", () => {
      let result: JSX.Element | undefined;

      for (let i = 0; i < BATCH; i += 1) {
        result = Sidebar({
          children: <div>Docs</div>,
        });
      }

      consume(result);
    });
  });

  describe("sidebar updates", () => {
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

    bench("sidebar link cycle", async () => {
      const link = scenario?.container.querySelector(
        '[data-slot="nav-item"][href="/docs/components"]',
      ) as HTMLAnchorElement | null;

      link?.click();
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

  describe("core remounts", () => {
    function RemountCoreLayout(props: { children?: unknown }): JSX.Element {
      const { children } = props;

      return (
        <Block minHeight="screen">
          <Header>
            <Container paddingY="md">
              <div data-bench="remount-header">Docs</div>
            </Container>
          </Header>
          <Main>
            <Container paddingY="xl">{children}</Container>
          </Main>
        </Block>
      );
    }

    bench("core remount cycle", async () => {
      const scenario = await mountScenario("/docs", () => {
        group({ layout: RemountCoreLayout }, () => {
          route("/docs", () => buildRouteTransitionPage({ title: "Docs", rows: 8 }));
        });
      });

      try {
        expect(scenario.container.querySelector('[data-slot="header"]')).not.toBeNull();
        expect(scenario.container.querySelector('[data-slot="main"]')).not.toBeNull();
      } finally {
        scenario.cleanup();
        clearRoutes();
        await settle();
      }
    });
  });
});
