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
import { Breadcrumb, Pagination, Pill, Pills, Tab, Tabs } from "@askrjs/themes/navs";
import { Button, Field, Input, InputGroup, Select } from "@askrjs/themes/controls";
import {
  AspectRatio,
  Avatar,
  Card,
  Alert,
  Badge,
  Progress,
  Spinner,
  Table,
} from "@askrjs/themes/surfaces";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DropdownItem,
} from "@askrjs/themes/overlays";
```

Themes re-exports the small set of styled primitives that are common in app
code. `@askrjs/ui` still owns behavior, keyboard handling, focus management,
and advanced primitives.

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
<Block as="main" maxWidth="page" marginX="auto" paddingX="page" paddingY="xl" gap="lg">
  <h1>Dashboard</h1>
  <p>Page content.</p>
</Block>
```

Responsive behavior uses one pattern everywhere:

```tsx
<Block direction={{ base: "column", lg: "row" }} gap="lg">
  <Block grow padding="lg" border radius="lg">
    Projects
  </Block>
  <Block grow padding="lg" border radius="lg">
    Activity
  </Block>
  <Block grow padding="lg" border radius="lg">
    Usage
  </Block>
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
```

## Common Composition

Common composition components are exported only when their meaning is stable
across applications:

- `Page`: main plus centered page content.
- `PageHeader`: title, optional description, and optional actions.
- `Toolbar`: compact title plus actions row.
- `EmptyState`: consistent empty or no-results messaging.

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
    <NavLink href="/dashboard" match="exact">
      Dashboard
    </NavLink>
    <NavLink href="/projects">Projects</NavLink>
  </NavGroup>
</Navbar>
```

Responsive Navbar uses one prop. At small widths the brand remains visible and
the rest of the content expands from a toggle.

```tsx
<Navbar aria-label="Primary" collapseAt="md">
  <NavBrand asChild>
    <Link href="/">Askr</Link>
  </NavBrand>
  <NavLink href="/dashboard" match="exact">
    Dashboard
  </NavLink>
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
  <NavLink href="/dashboard" match="exact">
    Dashboard
  </NavLink>
  <NavDropdown label="More">
    <DropdownItem asChild>
      <a href="/settings">Settings</a>
    </DropdownItem>
  </NavDropdown>
</Navbar>
```

Use `Tabs` and `Tab` for local section navigation. Use `Pills` and `Pill` for
compact rounded navigation. The item name carries the visual shape, so there is
no nav variant prop:

```tsx
<Tabs aria-label="Settings sections">
  <Tab href="/settings/profile">Profile</Tab>
  <Tab href="/settings/billing">Billing</Tab>
  <Tab href="/settings/security">Security</Tab>
</Tabs>

<Pills aria-label="Project views">
  <Pill href="/projects/open">Open</Pill>
  <Pill href="/projects/archived">Archived</Pill>
</Pills>
```

## Status And Overlays

Use `Badge` for small non-interactive labels such as status, plan, or metadata.
Use `Alert` for inline feedback. Passing `onDismiss` makes an alert dismissible;
there is no separate dismissible flag.

```tsx
<Alert
  title="Deploy queued"
  description="Production will update after the current job finishes."
  variant="info"
  onDismiss={() => setVisible(false)}
/>
<Badge variant="success">Live</Badge>
```

Use `Dialog` for modal content and `AlertDialog` for destructive confirmations.
Do not create a second `Modal` abstraction. Use `Popover`, `Tooltip`, and
`Toast` from `@askrjs/themes/overlays` for common floating UI. Import advanced
overlay primitives from `@askrjs/ui`.

```tsx
<Dialog>
  <DialogTrigger>Edit profile</DialogTrigger>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>Update the account details shown to teammates.</DialogDescription>
    </DialogContent>
  </DialogPortal>
</Dialog>
```

Chips and tags stay as recipes for now. If the UI only needs a visual label,
use `Badge`. If it needs a removable filter token, compose the local product
interaction from existing controls until that pattern is stable enough to
promote.

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

Use [Component Anatomy](./component-anatomy.md) when you need exact slot names,
alias classes, and safe override examples. Use
[Safe Customization](./customization.md) before adding new props to a themed
component. Use [App Recipes](./recipes.md) for copyable login, admin shell,
settings form, table, dropdown, and detail-page patterns that should remain in
userland.

## Package Boundary

Use `askr-themes` when you want the standard Askr visual language without
writing a token layer. Skip it when you already have a full design system.
Behavior and accessibility logic remain owned by `@askrjs/askr` and
`@askrjs/ui`; this package supplies themed composition and CSS.

## See Also

- [Tokens](./tokens.md)
- [Theming](./theming.md)
- [Component Anatomy](./component-anatomy.md)
- [Safe Customization](./customization.md)
- [App Recipes](./recipes.md)
- [Architecture](./architecture.md)
