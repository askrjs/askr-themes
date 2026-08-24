import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";

import {
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarScope,
} from "../../src/components";
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
    resetTestRoutes();
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    resetTestRoutes();
  });

  for (const direction of ["ltr", "rtl"] as const) {
    it(`should narrow an icon sidebar and dock its right side after the inset in ${direction}`, async () => {
      testRoute("/docs", () => (
        <SidebarScope dir={direction}>
          <Sidebar collapsible="icon" side="right" aria-label="Workspace navigation">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <svg aria-hidden="true" viewBox="0 0 16 16" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
          <SidebarRail aria-label="Resize workspace navigation" />
          <SidebarInset>Workspace</SidebarInset>
        </SidebarScope>
      ));

      await createSPA({ root: container!, registry: createTestRegistry() });
      await settle();

      const scope = container?.querySelector('[data-slot="sidebar-scope"]') as HTMLElement;
      const sidebar = container?.querySelector('[data-slot="sidebar"]') as HTMLElement;
      const rail = container?.querySelector('[data-slot="sidebar-rail"]') as HTMLElement;
      const inset = container?.querySelector('[data-slot="sidebar-inset"]') as HTMLElement;
      const rootFontSize = px(getComputedStyle(document.documentElement).fontSize);
      const railWidth =
        Number.parseFloat(
          getComputedStyle(sidebar).getPropertyValue("--ak-layout-sidebar-rail-width"),
        ) * rootFontSize;

      expect(sidebar.getBoundingClientRect().width).toBeCloseTo(railWidth, 0);
      expect(sidebar.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        inset.getBoundingClientRect().right - 1,
      );
      expect(rail.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        inset.getBoundingClientRect().right - 1,
      );
      expect(rail.getBoundingClientRect().right).toBeCloseTo(
        sidebar.getBoundingClientRect().left,
        0,
      );
      expect(sidebar.getBoundingClientRect().right).toBeCloseTo(
        scope.getBoundingClientRect().right,
        0,
      );
      expect(
        getComputedStyle(container!.querySelector('[data-slot="sidebar-menu-button"] span')!)
          .display,
      ).toBe("none");
    });

    it(`should keep a left sidebar rail between the sidebar and inset in ${direction}`, async () => {
      testRoute("/docs", () => (
        <SidebarScope dir={direction}>
          <Sidebar side="left" aria-label="Workspace navigation" />
          <SidebarRail aria-label="Resize workspace navigation" />
          <SidebarInset>Workspace</SidebarInset>
        </SidebarScope>
      ));

      await createSPA({ root: container!, registry: createTestRegistry() });
      await settle();

      const sidebar = container?.querySelector('[data-slot="sidebar"]') as HTMLElement;
      const rail = container?.querySelector('[data-slot="sidebar-rail"]') as HTMLElement;
      const inset = container?.querySelector('[data-slot="sidebar-inset"]') as HTMLElement;

      expect(sidebar.getBoundingClientRect().right).toBeCloseTo(
        rail.getBoundingClientRect().left,
        0,
      );
      expect(rail.getBoundingClientRect().right).toBeCloseTo(inset.getBoundingClientRect().left, 0);
    });
  }

  it("should render sidebar as a semantic Block preset beside main content", async () => {
    testRoute("/docs", () => (
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
    testRoute("/docs/components", () => <div id="page">Components</div>);

    await createSPA({ root: container!, registry: createTestRegistry() });
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
