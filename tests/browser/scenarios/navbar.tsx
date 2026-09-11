import { Link } from "@askrjs/askr/router";

import { SidebarMenuButton } from "../../../src/components/sidebar";
import {
  Block,
  Container,
  Header,
  NavBrand,
  NavDropdown,
  NavGroup,
  NavLink,
  Navbar,
} from "../../../src/core";
import { DropdownItem } from "../../../src/overlays";
import { mountRoute, mountRoutes } from "./_spa";

import "../../../src/themes/default/index.css";

/** A theme control that renders an explicitly false ARIA state. */
export async function explicitFalseAria(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/docs", () => (
    <div>
      <SidebarMenuButton aria-expanded={false}>Database</SidebarMenuButton>
    </div>
  ));
}

/** Header + Container + Block shell around a navbar with a single nav group. */
export async function semanticStructure(root: HTMLElement): Promise<void> {
  await mountRoutes(
    root,
    {
      "/docs": () => (
        <Header sticky>
          <Container>
            <Block direction="row" align="center" justify="between" paddingY="md">
              <a href="/">Askr</a>
              <Navbar aria-label="Docs navigation">
                <NavGroup title="Docs">
                  <NavLink href="/docs" match="exact">
                    Overview
                  </NavLink>
                  <NavLink href="/docs/components">Components</NavLink>
                </NavGroup>
              </Navbar>
            </Block>
          </Container>
        </Header>
      ),
      "/docs/components": () => <div id="page">Components</div>,
    },
    "/docs",
  );
}

/** Brand, centered primary routes, and an end-aligned action group. */
export async function centeredRoutes(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/docs", () => (
    <Header sticky>
      <Container>
        <Navbar aria-label="App navigation">
          <NavBrand asChild>
            <Link href="/">Askr</Link>
          </NavBrand>
          <NavGroup>
            <NavLink href="/docs" match="exact">
              Overview
            </NavLink>
            <NavLink href="/docs/components">Components</NavLink>
            <NavLink href="/docs/contact">Contact</NavLink>
          </NavGroup>
          <NavGroup align="end">
            <button data-slot="button">Theme</button>
          </NavGroup>
        </Navbar>
      </Container>
    </Header>
  ));
}

/** A full-width collapsible navbar rendered above its collapse breakpoint. */
export async function collapsedDesktopGroups(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/docs", () => (
    <Navbar width="full" collapseAt="md" aria-label="Responsive app navigation">
      <NavBrand as="a" href="/">
        Askr
      </NavBrand>
      <NavGroup>
        <NavLink href="/docs">Docs</NavLink>
      </NavGroup>
      <NavGroup align="end">
        <button data-slot="button">Account</button>
      </NavGroup>
    </Navbar>
  ));
}

/** A wide brand label inside a narrow navbar, next to centered routes. */
export async function brandOverlap(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/docs", () => (
    <div style={{ width: "390px" }}>
      <Navbar aria-label="App navigation">
        <NavBrand asChild>
          <Link href="/">
            <span aria-hidden="true">◆</span>
            <span>Destroyer</span>
          </Link>
        </NavBrand>
        <NavGroup>
          <NavLink href="/docs" match="exact">
            Overview
          </NavLink>
          <NavLink href="/docs/about">About</NavLink>
          <NavLink href="/docs/contact">Contact</NavLink>
        </NavGroup>
        <NavGroup align="end">
          <button data-slot="button">Theme</button>
        </NavGroup>
      </Navbar>
    </div>
  ));
}

/** The same collapsing navbar on every route, so it survives navigation. */
export async function responsiveNavbar(root: HTMLElement): Promise<void> {
  const ResponsiveNav = () => (
    <Navbar aria-label="Responsive docs navigation" collapseAt="md">
      <NavBrand asChild>
        <Link href="/">Askr</Link>
      </NavBrand>
      <NavLink href="/docs" match="exact">
        Overview
      </NavLink>
      <NavLink href="/docs/components">Components</NavLink>
    </Navbar>
  );

  await mountRoutes(
    root,
    {
      "/docs": () => (
        <>
          <ResponsiveNav />
          <div id="page">Docs</div>
        </>
      ),
      "/docs/components": () => (
        <>
          <ResponsiveNav />
          <div id="page">Components</div>
        </>
      ),
      "/": () => (
        <>
          <ResponsiveNav />
          <div id="page">Home</div>
        </>
      ),
    },
    "/docs",
  );
}

/** A navbar dropdown whose items are route-aware NavLinks. */
export async function navDropdown(root: HTMLElement): Promise<void> {
  await mountRoutes(
    root,
    {
      "/docs": () => (
        <Navbar aria-label="Dropdown docs navigation">
          <NavBrand as="a" href="/">
            Askr
          </NavBrand>
          <NavDropdown label="More">
            <DropdownItem asChild>
              <NavLink href="/docs/components">Components</NavLink>
            </DropdownItem>
          </NavDropdown>
        </Navbar>
      ),
      "/docs/components": () => <div id="page">Components</div>,
    },
    "/docs",
  );
}
