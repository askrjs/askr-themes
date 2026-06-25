# @askrjs/themes

Default theme tokens, styles, and visual components for Askr applications.

## Contents

- [Overview](./askr-themes.md) - the public API and composition model
- [Tokens](./tokens.md) - design token reference and overrides
- [Theming](./theming.md) - CSS architecture, selector contracts, and visual QA
- [Regression coverage](./regression-coverage.md) - permanent coverage matrix

## Quick Start

```bash
npm install @askrjs/themes
```

Import the default theme once at the app entry:

```ts
import "@askrjs/themes/default";
```

Use the core public surface for page structure:

```ts
import { Link } from "@askrjs/askr/router";
import {
  Block,
  Container,
  Header,
  Main,
  Navbar,
  NavBrand,
  NavDropdown,
  NavGroup,
  NavItem,
  NavLink,
  Page,
  PageHeader,
  Toolbar,
  EmptyState,
} from "@askrjs/themes/core";
import { DropdownItem } from "@askrjs/themes/overlays";
```

The mental model is intentionally small:

- `Block` builds structure.
- `Container` constrains width.
- Semantic wrappers improve readability.
- Visual components provide appearance.

`Block` is the only layout engine. Use it for spacing, sizing, flex direction,
responsive values, alignment, semantic elements, and common visual primitives.
Use readable prop names such as `paddingX` and `marginX`; shorthand aliases
such as `px` and `mx` are intentionally not part of the API.

```tsx
export function DashboardPage() {
  return (
    <>
      <Header sticky>
        <Container paddingY="md">
          <Navbar aria-label="Primary" collapseAt="md">
            <NavBrand asChild>
              <Link href="/">Askr</Link>
            </NavBrand>
            <NavLink href="/dashboard" match="exact">
              Dashboard
            </NavLink>
            <NavLink href="/projects">Projects</NavLink>
            <NavDropdown label="More">
              <DropdownItem asChild>
                <a href="/settings">Settings</a>
              </DropdownItem>
            </NavDropdown>
          </Navbar>
        </Container>
      </Header>
      <Page>
        <PageHeader
          title="Dashboard"
          description="Overview of your workspace."
          actions={<button type="button">New project</button>}
        />
        <Block direction={{ base: "column", lg: "row" }} gap="lg">
          <Block grow padding="lg" border radius="lg" gap="sm">
            <h3>Projects</h3>
            <p>Active project work.</p>
          </Block>
          <Block grow padding="lg" border radius="lg" gap="sm">
            <h3>Activity</h3>
            <p>Recent workspace updates.</p>
          </Block>
          <Block grow padding="lg" border radius="lg" gap="sm">
            <h3>Usage</h3>
            <p>Current workspace metrics.</p>
          </Block>
        </Block>
      </Page>
    </>
  );
}
```

## Entrypoints

```ts
import {
  Aside,
  Block,
  Container,
  Header,
  Main,
  Navbar,
  NavBrand,
  NavDropdown,
  NavGroup,
  NavItem,
  NavLink,
  Page,
  PageHeader,
  Section,
  Sidebar,
  Toolbar,
} from "@askrjs/themes/core";
import { Nav, Breadcrumb, Pagination } from "@askrjs/themes/navs";
import { Button, ButtonGroup, Field, InputGroup } from "@askrjs/themes/controls";
import { AspectRatio, Card, CardActions, Alert, Badge, ListGroup } from "@askrjs/themes/surfaces";
import { EmptyState, Spinner } from "@askrjs/themes/feedback";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@askrjs/themes/overlays";
```

`@askrjs/themes/core` exports the stable semantic core:

```ts
export {
  Block,
  Container,
  Header,
  Main,
  Section,
  Aside,
  Sidebar,
  Navbar,
  NavBrand,
  NavDropdown,
  NavGroup,
  NavItem,
  NavLink,
  Page,
  PageHeader,
  Toolbar,
  EmptyState,
};
```

## Recipes

Navbar has one default shape: put `NavBrand` first, then links, groups, or a
simple `NavDropdown`. Add `collapseAt` only when the inline content should move
behind a menu below that breakpoint.
Use `NavLink` for app routes. Use `NavItem` for external or manually active
anchors.

```tsx
<Navbar aria-label="Primary" collapseAt="md">
  <NavBrand asChild>
    <Link href="/">Askr</Link>
  </NavBrand>
  <NavLink href="/dashboard" match="exact">Dashboard</NavLink>
  <NavLink href="/projects">Projects</NavLink>
  <NavDropdown label="More">
    <DropdownItem asChild>
      <a href="/settings">Settings</a>
    </DropdownItem>
  </NavDropdown>
</Navbar>
```

Keep app-specific composition in userland until the pattern is proven stable.
Good recipe candidates include centered pages, sidebar layouts, split pages,
form pages, responsive rows, panel grids, card lists, and form actions.

```tsx
export function AccountPage() {
  return (
    <Main>
      <Container size="sm">
        <Block paddingY="xl" gap="lg">
          <PageHeader title="Account" description="Edit your profile." />
          <Block as="form" gap="md">
            <Field label="Name" name="name" />
            <Field label="Email" name="email" />
            <Block direction="row" justify="end" gap="sm">
              <button type="button">Cancel</button>
              <button type="submit">Save</button>
            </Block>
          </Block>
        </Block>
      </Container>
    </Main>
  );
}
```

## Theme Controls

Theme state helpers are available from the theme entrypoint:

```tsx
import { ThemePicker, ThemeProvider, ThemeToggle } from "@askrjs/themes/theme";

export function App({ children }: { children?: unknown }) {
  return (
    <ThemeProvider>
      <ThemePicker />
      <ThemeToggle lightIcon={<SunIcon />} darkIcon={<MoonIcon />} />
      {children}
    </ThemeProvider>
  );
}
```

## Visual Quality

The default theme targets quiet product and admin surfaces: compact density,
deliberate typography, restrained color, and predictable responsive behavior.
Use [../visual-check.html](../visual-check.html) as the manual audit page and
inspect light and dark mode at `320`, `390`, `768`, `1024`, and desktop widths.
