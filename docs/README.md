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
  EmptyState,
} from "@askrjs/themes/core";
import { Nav, Breadcrumb, Pagination } from "@askrjs/themes/navs";
import { Button, ButtonGroup, Field, Input, InputGroup, Select } from "@askrjs/themes/controls";
import {
  AspectRatio,
  Avatar,
  Card,
  CardActions,
  Alert,
  Badge,
  ListGroup,
  Progress,
  Spinner,
  Table,
} from "@askrjs/themes/surfaces";
import {
  Dialog,
  DialogContent,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@askrjs/themes/overlays";
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

If the default theme styles a `@askrjs/ui` primitive, import it from the matching
`@askrjs/themes/*` family. `@askrjs/ui` owns behavior; `@askrjs/themes` is the
KISS import path for styled app components.

## Recipes

Navbar has one default shape: put `NavBrand` first, then links, groups, or a
simple `NavDropdown`. Add `collapseAt` only when the inline content should
collapse behind a toggle below that breakpoint.
Use `NavLink` for app routes. Use `NavItem` for external or manually active
anchors. `NavItem` has one shape: use `active` for manual state and `class` or
`style` for rare custom treatment.

```tsx
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
```

Keep app-specific composition in userland until the pattern is proven stable.
Good recipe candidates include centered pages, sidebar layouts, split pages,
form pages, responsive rows, panel grids, card lists, and form actions.

Use `Dialog` for modal surfaces and `AlertDialog` for destructive confirmations.
Do not introduce a separate `Modal` component. Use `Badge` for small status or
metadata labels, and `Alert` for inline feedback. Keep chips/tags as recipes
until a product needs a distinct interactive or removable token contract.

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
