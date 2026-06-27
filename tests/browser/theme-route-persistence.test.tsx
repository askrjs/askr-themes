import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { createQuery } from "@askrjs/askr/data";
import { clearRoutes, getManifest, group, navigate, route } from "@askrjs/askr/router";

import { Block, Container, Header, Main, NavGroup, Navbar } from "../../src/core";
import { CAT_THEME_NAMES, CAT_THEME_OPTIONS, ThemeProvider, ThemeToggle } from "../../src/theme";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("theme route persistence in the browser", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.localStorage.removeItem("askr-theme");
    window.history.replaceState({}, "", "/example");
    clearRoutes();
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }
    clearRoutes();
    window.localStorage.removeItem("askr-theme");
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-choice");
  });

  it("should preserves theme state across navigation and repeated toggles", async () => {
    const AppLayout = ({ children }: { children?: unknown }) => (
      <ThemeProvider defaultTheme="light">
        <header>
          <ThemeToggle />
        </header>
        <main>{children}</main>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/example", () => <div id="page">Example</div>);
      route("/about", () => <div id="page">About</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });

    expect(container.querySelector('[data-slot="theme-provider"]')).not.toBeNull();
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme-choice")).toBeNull();

    await settle();

    const toggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;
    const html = document.documentElement;

    expect(container.querySelector('[data-slot="theme-provider"]')).not.toBeNull();
    expect(toggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(html.getAttribute("data-theme")).toBe("light");
    expect(html.getAttribute("data-theme-choice")).toBe("light");

    toggle?.click();
    await settle();

    const darkToggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(darkToggle?.getAttribute("data-theme-choice")).toBe("dark");
    expect(darkToggle?.getAttribute("data-next-theme")).toBe("light");
    expect(html.getAttribute("data-theme")).toBe("dark");
    expect(html.getAttribute("data-theme-choice")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");

    navigate("/about");
    await settle();

    const afterNavigateToggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(container.querySelector("#page")?.textContent).toBe("About");
    expect(afterNavigateToggle?.getAttribute("data-theme-choice")).toBe("dark");
    expect(html.getAttribute("data-theme")).toBe("dark");
    expect(html.getAttribute("data-theme-choice")).toBe("dark");
    expect(window.localStorage.getItem("askr-theme")).toBe("dark");

    afterNavigateToggle?.click();
    await settle();

    const lightToggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(lightToggle?.getAttribute("data-theme-choice")).toBe("light");
    expect(lightToggle?.getAttribute("data-next-theme")).toBe("dark");
    expect(html.getAttribute("data-theme")).toBe("light");
    expect(html.getAttribute("data-theme-choice")).toBe("light");
    expect(window.localStorage.getItem("askr-theme")).toBe("light");
  });

  it("should preserves cat preset theme state across navigation and repeated toggles", async () => {
    const AppLayout = ({ children }: { children?: unknown }) => (
      <ThemeProvider defaultTheme="tabby" themes={CAT_THEME_OPTIONS}>
        <header>
          <ThemeToggle themes={CAT_THEME_NAMES}>{({ nextTheme }) => nextTheme}</ThemeToggle>
        </header>
        <main>{children}</main>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/example", () => <div id="page">Example</div>);
      route("/about", () => <div id="page">About</div>);
    });

    await createSPA({ root: container!, manifest: getManifest() });

    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    expect(document.documentElement.getAttribute("data-theme-choice")).toBeNull();

    await settle();

    const toggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;
    const html = document.documentElement;

    expect(toggle?.getAttribute("data-theme-choice")).toBe("tabby");
    expect(toggle?.getAttribute("data-next-theme")).toBe("ginger");
    expect(toggle?.textContent).toBe("ginger");
    expect(html.getAttribute("data-theme")).toBe("tabby");
    expect(html.getAttribute("data-theme-choice")).toBe("tabby");

    toggle?.click();
    await settle();

    const gingerToggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(gingerToggle?.getAttribute("data-theme-choice")).toBe("ginger");
    expect(gingerToggle?.getAttribute("data-next-theme")).toBe("tuxedo");
    expect(gingerToggle?.textContent).toBe("tuxedo");
    expect(html.getAttribute("data-theme")).toBe("ginger");
    expect(html.getAttribute("data-theme-choice")).toBe("ginger");
    expect(window.localStorage.getItem("askr-theme")).toBe("ginger");

    navigate("/about");
    await settle();

    const afterNavigateToggle = container.querySelector(
      '[data-theme-control="toggle"]',
    ) as HTMLButtonElement | null;

    expect(container.querySelector("#page")?.textContent).toBe("About");
    expect(afterNavigateToggle?.getAttribute("data-theme-choice")).toBe("ginger");
    expect(afterNavigateToggle?.getAttribute("data-next-theme")).toBe("tuxedo");
    expect(afterNavigateToggle?.textContent).toBe("tuxedo");
    expect(html.getAttribute("data-theme")).toBe("ginger");
    expect(html.getAttribute("data-theme-choice")).toBe("ginger");
    expect(window.localStorage.getItem("askr-theme")).toBe("ginger");
  });

  it("should keep pending routed content recoverable after repeated theme toggles", async () => {
    let resolveTopology: (() => void) | undefined;
    let topologyFetchCount = 0;

    async function fetchTopology(): Promise<{ name: string }> {
      topologyFetchCount += 1;
      await new Promise<void>((resolve) => {
        resolveTopology = resolve;
      });
      return { name: "Messaging topology" };
    }

    function TopologyPage(): JSX.Element {
      const topology = createQuery({
        key: "topology",
        fetch: fetchTopology,
      });

      return (
        <section data-slot="topology-page">
          {topology.loading ? "Loading messaging topology..." : topology.data?.name}
        </section>
      );
    }

    const AppLayout = ({ children }: { children?: unknown }) => (
      <ThemeProvider defaultTheme="light">
        <Header>
          <Container>
            <Block direction="row" align="center" justify="between" paddingY="md">
              <a href="/">
                <strong>Fitz</strong>
              </a>
              <Navbar aria-label="Navigation">
                <NavGroup align="end">
                  <ThemeToggle />
                </NavGroup>
              </Navbar>
            </Block>
          </Container>
        </Header>
        <Main>{children}</Main>
      </ThemeProvider>
    );

    group({ layout: AppLayout }, () => {
      route("/theme-stall", () => <TopologyPage />);
    });

    window.history.replaceState({}, "", "/theme-stall");
    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const getToggle = () =>
      container?.querySelector('[data-theme-control="toggle"]') as HTMLButtonElement | null;
    const page = () =>
      container?.querySelector('[data-slot="topology-page"]')?.textContent?.trim() ?? "";

    expect(page()).toBe("Loading messaging topology...");
    expect(topologyFetchCount).toBe(1);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    getToggle()?.click();
    await settle();
    getToggle()?.click();
    await settle();

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(topologyFetchCount).toBe(1);

    resolveTopology?.();
    await settle();

    expect(page()).toBe("Messaging topology");
    expect(container?.querySelector('[data-slot="theme-provider"]')).not.toBeNull();
  });
});
