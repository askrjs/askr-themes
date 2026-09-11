import { Block, Main, NavGroup, NavLink, Navbar, Sidebar } from "../../../src/core";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "../../../src/overlays";
import { mountRoutes } from "./_spa";

import "../../../src/themes/default/index.css";

/** Navbar + sidebar shells that both host a real Dropdown. */
export async function first(root: HTMLElement): Promise<void> {
  await mountRoutes(
    root,
    {
      "/docs": () => (
        <Block minHeight="screen" direction="row">
          <Sidebar aria-label="Sidebar navigation">
            <NavGroup title="Workspace">
              <Dropdown id="sidebar-workspace-dropdown">
                <DropdownTrigger>Workspace</DropdownTrigger>
                <DropdownContent aria-label="Sidebar workspace menu" side="right" sideOffset={4}>
                  <DropdownItem asChild>
                    <NavLink href="/docs/audit">Audit log</NavLink>
                  </DropdownItem>
                  <DropdownItem>Switch workspace</DropdownItem>
                </DropdownContent>
              </Dropdown>
            </NavGroup>
          </Sidebar>
          <Main>
            <Navbar aria-label="Navbar navigation">
              <NavGroup title="Docs">
                <Dropdown id="navbar-product-dropdown">
                  <DropdownTrigger>Product</DropdownTrigger>
                  <DropdownContent aria-label="Product menu" sideOffset={4}>
                    <DropdownItem asChild>
                      <NavLink href="/docs/components">Components</NavLink>
                    </DropdownItem>
                    <DropdownItem>Copy link</DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </NavGroup>
            </Navbar>
          </Main>
        </Block>
      ),
      "/docs/audit": () => <div id="page">Audit log</div>,
      "/docs/components": () => <div id="page">Components</div>,
    },
    "/docs",
  );
}

/** The sidebar shell on its own, re-mounted after the first tree is torn down. */
export async function second(root: HTMLElement): Promise<void> {
  await mountRoutes(
    root,
    {
      "/docs": () => (
        <Sidebar aria-label="Sidebar navigation">
          <NavGroup title="Workspace">
            <Dropdown id="sidebar-workspace-dropdown">
              <DropdownTrigger>Workspace</DropdownTrigger>
              <DropdownContent aria-label="Sidebar workspace menu" side="right" sideOffset={4}>
                <DropdownItem>Switch workspace</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </NavGroup>
        </Sidebar>
      ),
    },
    "/docs",
  );
}
