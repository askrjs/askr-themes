import { createSPA } from "@askrjs/askr/boot";
import { createQuery } from "@askrjs/askr/data";
import { navigate } from "@askrjs/askr/router";

import { Block, Container, Header, Main, NavGroup, Navbar } from "../../../src/core";
import {
  CAT_THEME_NAMES,
  CAT_THEME_OPTIONS,
  ThemeScope,
  ThemeToggle,
  type ThemeToggleRenderContext,
} from "../../../src/theme";
import { createTestRegistry, resetTestRoutes, settle, testGroup, testRoute } from "./_spa";

/**
 * Theme persistence across navigation. Every case boots a layout-wrapped SPA on
 * `/example` with the stored theme cleared, and exposes `navigate` so the spec
 * can drive the router programmatically the way the original test did.
 */

function prepare(): void {
  window.localStorage.removeItem("askr-theme");
  window.history.replaceState({}, "", "/example");
  resetTestRoutes();
}

/** Router navigation plus a settle, so the spec can await the re-render. */
const routerControls = {
  navigate: async (path: string) => {
    navigate(path);
    await settle();
    return null;
  },
  settle: async () => {
    await settle();
    return null;
  },
};

export default async function themePersistence(root: HTMLElement): Promise<typeof routerControls> {
  prepare();

  const AppLayout = ({ children }: { children?: unknown }) => (
    <ThemeScope defaultTheme="light">
      <header>
        <ThemeToggle />
      </header>
      <main>{children}</main>
    </ThemeScope>
  );

  testGroup({ layout: AppLayout }, () => {
    testRoute("/example", () => <div id="page">Example</div>);
    testRoute("/about", () => <div id="page">About</div>);
  });

  await createSPA({ root, registry: createTestRegistry() });

  return routerControls;
}

export async function catPresets(root: HTMLElement): Promise<typeof routerControls> {
  prepare();

  const AppLayout = ({ children }: { children?: unknown }) => (
    <ThemeScope defaultTheme="tabby" themes={CAT_THEME_OPTIONS}>
      <header>
        <ThemeToggle themes={CAT_THEME_NAMES}>
          {({ nextTheme }: ThemeToggleRenderContext) => nextTheme}
        </ThemeToggle>
      </header>
      <main>{children}</main>
    </ThemeScope>
  );

  testGroup({ layout: AppLayout }, () => {
    testRoute("/example", () => <div id="page">Example</div>);
    testRoute("/about", () => <div id="page">About</div>);
  });

  await createSPA({ root, registry: createTestRegistry() });

  return routerControls;
}

/**
 * A route whose query never settles until the spec says so. `resolveTopology`
 * and `fetchCount` hand those browser-side closures back to the Node process.
 */
export async function pendingRoute(root: HTMLElement): Promise<{
  resolveTopology: () => Promise<null>;
  fetchCount: () => number;
  settle: () => Promise<null>;
}> {
  prepare();

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
    <ThemeScope defaultTheme="light">
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
    </ThemeScope>
  );

  testGroup({ layout: AppLayout }, () => {
    testRoute("/theme-stall", () => <TopologyPage />);
  });

  window.history.replaceState({}, "", "/theme-stall");
  await createSPA({ root, registry: createTestRegistry() });
  await settle();

  return {
    resolveTopology: async () => {
      resolveTopology?.();
      await settle();
      return null;
    },
    fetchCount: () => topologyFetchCount,
    settle: async () => {
      await settle();
      return null;
    },
  };
}
