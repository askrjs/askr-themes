import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { Block, Container, Main, NavGroup, NavLink, PageHeader, Sidebar } from "../../src/core";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

function px(value: string): number {
  return Number.parseFloat(value.replace("px", ""));
}

describe("sidebar browser smoke", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.history.replaceState({}, "", "/docs");
    clearRoutes();
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
  });

  it("should renders sidebar as a semantic Block preset beside main content", async () => {
    route("/docs", () => (
      <Block minHeight="screen" direction="row">
        <Sidebar aria-label="Workspace navigation">
          <strong>Askr</strong>
          <Block as="nav" gap="lg">
            <NavGroup title="Workspace">
              <NavLink href="/docs" match="exact">
                Overview
              </NavLink>
              <NavLink href="/docs/components">Components</NavLink>
            </NavGroup>
            <NavGroup title="Admin">
              <NavLink href="/settings">Settings</NavLink>
            </NavGroup>
          </Block>
        </Sidebar>
        <Main>
          <Container>
            <Block paddingY="xl" gap="lg">
              <PageHeader title="Overview" description="Workspace summary." />
              <p id="page">Docs content</p>
            </Block>
          </Container>
        </Main>
      </Block>
    ));
    route("/docs/components", () => <div id="page">Components</div>);

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const sidebar = container?.querySelector('[data-slot="sidebar"]') as HTMLElement | null;
    const main = container?.querySelector('[data-slot="main"]') as HTMLElement | null;
    const groups = container?.querySelectorAll('[data-slot="nav-group"]');
    const activeItem = container?.querySelector('[data-active="true"]') as HTMLElement | null;
    const link = container?.querySelector('a[href="/docs/components"]') as HTMLAnchorElement | null;

    expect(sidebar?.tagName).toBe("ASIDE");
    expect(sidebar?.getAttribute("aria-label")).toBe("Workspace navigation");
    expect(main?.tagName).toBe("MAIN");
    expect(groups?.length).toBe(2);
    expect(activeItem?.textContent).toBe("Overview");
    expect(px(getComputedStyle(sidebar!).width)).toBeGreaterThan(0);
    expect(getComputedStyle(sidebar!).borderRightWidth).not.toBe("0px");
    expect(getComputedStyle(main!).flexGrow).toBe("1");

    link?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );
    await settle();

    expect(window.location.pathname).toBe("/docs/components");
    expect(container?.querySelector("#page")?.textContent).toBe("Components");
  });
});
