# Styling: askr-themes

`@askrjs/themes` provides the default visual theme for Askr product and admin
applications. It supplies design tokens, focused visual components, and a small
set of semantic structure helpers.

## Design Model

`Block` is the only layout engine.

Everything structural is either:

- `Block` directly
- a semantic component built from `Block`

This removes the old choice between overlapping wrappers. When you need a
wrapper, start with `Block`. When the element has stable semantic meaning, use
the semantic wrapper.

## Public API

The stable core API is:

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

The focused entrypoints remain available:

```ts
import { Link } from "@askrjs/askr/router";
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
import { Button, Field, InputGroup } from "@askrjs/themes/controls";
import { AspectRatio, Card, Alert, Badge, ListGroup } from "@askrjs/themes/surfaces";
import { Spinner } from "@askrjs/themes/feedback";
import { DropdownItem } from "@askrjs/themes/overlays";
```

## Block

`Block` owns the common layout surface:

- spacing: `padding`, `paddingX`, `paddingY`, `margin`, `marginX`, `marginY`, `gap`
- sizing: `width`, `minWidth`, `maxWidth`, `height`, `minHeight`, `maxHeight`
- flex layout: `direction`, `align`, `justify`, `grow`, `shrink`
- responsive values: `{ base, sm, md, lg, xl }`
- semantics: `as`
- common visuals: `background`, `border`, `borderBottom`, `borderRight`, `radius`, `shadow`

Use explicit prop names. The API intentionally avoids shorthand aliases such as
`px`, `mx`, or generic CSS recreation. Rare CSS belongs in `class` or `style`.

```tsx
<Block
  as="main"
  maxWidth="page"
  marginX="auto"
  paddingX="page"
  paddingY="xl"
  gap="lg"
>
  <h1>Dashboard</h1>
  <p>Page content.</p>
</Block>
```

Responsive behavior uses one pattern everywhere:

```tsx
<Block direction={{ base: "column", lg: "row" }} gap="lg">
  <Block grow padding="lg" border radius="lg">Projects</Block>
  <Block grow padding="lg" border radius="lg">Activity</Block>
  <Block grow padding="lg" border radius="lg">Usage</Block>
</Block>
```

## Semantic Wrappers

Semantic wrappers add readability and sensible defaults. They do not introduce
another layout system.

- `Container`: constrains width and applies page gutters.
- `Header`: semantic header with surface background and optional sticky mode.
- `Main`: semantic main region that can grow inside app frames.
- `Section`: semantic page section with default vertical rhythm.
- `Aside` and `Sidebar`: semantic side regions.
- `Navbar`, `NavBrand`, `NavDropdown`, `NavGroup`, `NavLink`, and `NavItem`: lightweight navigation structure.

```tsx
<Header sticky>
  <Container paddingY="md">
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
  </Container>
</Header>
```

## Common Composition

Common composition components are exported only when their meaning is stable
across applications:

- `Page`: main plus centered page content.
- `PageHeader`: title, optional description, and optional actions.
- `Toolbar`: compact title plus actions row.
- `EmptyState`: consistent empty or no-results feedback.

Application-specific layouts stay as recipes. Compose centered pages, sidebar
layouts, split pages, form pages, responsive rows, panel grids, card lists, and
form actions locally until repeated use proves they deserve promotion.

```tsx
export function ProjectsPage() {
  return (
    <Page>
      <PageHeader title="Projects" actions={<button type="button">New project</button>} />
      <EmptyState
        title="No projects yet"
        description="Create your first project to get started."
        action={<button type="button">Create project</button>}
      />
    </Page>
  );
}
```

## Navigation

Use `Navbar`, `NavBrand`, `NavDropdown`, `NavGroup`, `NavLink`, and `NavItem`
for stable semantic navigation chrome. Use `NavLink` for app routes. Use
`NavItem` for external or manually active anchors. `NavItem` has one shape:
use `active` for manual state and `class` or `style` for rare custom treatment.

```tsx
<Navbar aria-label="Primary">
  <NavBrand asChild>
    <Link href="/">Askr</Link>
  </NavBrand>
  <NavGroup title="Workspace">
    <NavLink href="/dashboard" match="exact">Dashboard</NavLink>
    <NavLink href="/projects">Projects</NavLink>
  </NavGroup>
</Navbar>
```

Responsive Navbar uses one prop. At small widths the brand remains visible and
the rest of the content moves into a menu.

```tsx
<Navbar aria-label="Primary" collapseAt="md">
  <NavBrand asChild>
    <Link href="/">Askr</Link>
  </NavBrand>
  <NavLink href="/dashboard" match="exact">Dashboard</NavLink>
  <NavLink href="/projects">Projects</NavLink>
</Navbar>
```

Use `NavDropdown` for simple single-level menus. Use overlay primitives directly
when a product needs more custom behavior.

```tsx
<Navbar aria-label="Primary">
  <NavBrand asChild>
    <Link href="/">Askr</Link>
  </NavBrand>
  <NavLink href="/dashboard" match="exact">Dashboard</NavLink>
  <NavDropdown label="More">
    <DropdownItem asChild>
      <a href="/settings">Settings</a>
    </DropdownItem>
  </NavDropdown>
</Navbar>
```

`NavLink` still handles route matching and client-side navigation:

```tsx
<Nav aria-label="Settings sections" variant="tabs">
  <NavLink href="/settings/profile">Profile</NavLink>
  <NavLink href="/settings/billing">Billing</NavLink>
  <NavLink href="/settings/security">Security</NavLink>
</Nav>
```

## Theming

Import the default theme once:

```ts
import "@askrjs/themes/default";
```

Override tokens after that import when needed:

```css
:root {
  --ak-color-primary: #0ea5e9;
  --ak-radius-md: 8px;
}
```

`data-slot` is the canonical styling contract. The default theme keeps class
aliases selective and focused on raw HTML ergonomics. Prefer tokens and
documented `data-slot` hooks for durable customization.

## Package Boundary

Use `askr-themes` when you want the standard Askr visual language without
writing a token layer. Skip it when you already have a full design system.
Behavior and accessibility logic remain owned by `@askrjs/askr` and
`@askrjs/ui`; this package supplies themed composition and CSS.

## See Also

- [Tokens](./tokens.md)
- [Theming](./theming.md)
- [Architecture](./architecture.md)
