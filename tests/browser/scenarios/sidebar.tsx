import {
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarScope,
} from "../../../src/components";
import { Block, Container, Main, NavGroup, NavLink, PageHeader, Sidebar } from "../../../src/core";
import { mountRoute, mountRoutes } from "./_spa";

import "../../../src/themes/default/index.css";

/** Writing direction the scope renders under; the spec parameterises both. */
interface DirectionOptions {
  direction: "ltr" | "rtl";
}

/** An icon-collapsed sidebar docked on the right of its scope. */
export async function iconSidebar(root: HTMLElement, options: DirectionOptions): Promise<void> {
  await mountRoute(root, "/docs", () => (
    <SidebarScope dir={options.direction}>
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
}

/** A left-side sidebar with its rail between the sidebar and the inset. */
export async function leftRail(root: HTMLElement, options: DirectionOptions): Promise<void> {
  await mountRoute(root, "/docs", () => (
    <SidebarScope dir={options.direction}>
      <Sidebar side="left" aria-label="Workspace navigation" />
      <SidebarRail aria-label="Resize workspace navigation" />
      <SidebarInset>Workspace</SidebarInset>
    </SidebarScope>
  ));
}

/** The sidebar rendered as a Block preset beside `Main` page content. */
export async function semanticBlock(root: HTMLElement): Promise<void> {
  await mountRoutes(
    root,
    {
      "/docs": () => (
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
      ),
      "/docs/components": () => <div id="page">Components</div>,
    },
    "/docs",
  );
}
