# @askrjs/themes

Default theme tokens, styles, and visual components for askr-ui applications.

## Contents

- [Overview](./askr-themes.md) - What askr-themes is and when to use it
- [Tokens](./tokens.md) - Design token reference and overrides
- [Theming](./theming.md) - Layered CSS architecture and dark mode

## Quick start

```bash
bun add @askrjs/themes
```

```ts
import "@askrjs/themes/default";
```

For reusable shell chrome:

```ts
import { Header, Shell, ShellMain, ShellNav, Sidebar } from "@askrjs/themes/shells";
```

For navigation primitives:

```ts
import { Nav, NavBrand, NavGroup, NavItem, NavLink, Navbar } from "@askrjs/themes/navs";
```

For form helpers:

```ts
import { Field, FieldError, FieldHint, InputGroup } from "@askrjs/themes/controls";
```

For layout primitives:

```ts
import { AspectRatio, Block, Container, Flex, Section, Stack } from "@askrjs/themes/layouts";
```

For layout primitives, use each one for a specific concern rather than treating
them as interchangeable:

- `Container` constrains width and preserves gutters.
- `Section` establishes major vertical page regions.
- `Stack` spaces content in one vertical flow.
- `Block` wraps related content into responsive columns.

The detailed rationale and composition guidance lives in [Overview](./askr-themes.md).

`Sidebar` is the vertical shell wrapper. Compose the brand, rail toggle, and nav
groups inline; the mobile drawer is generated from that same content when
`breakpoint` is set. `Navbar` is for horizontal topbars. Use `align="end"` when a
group should sit at the far edge in either shell orientation:

```tsx
import { NavBrand, NavGroup, NavLink, Sidebar, SidebarToggle } from "@askrjs/themes/shells";

export function DocsSidebar() {
  return (
    <Sidebar aria-label="Docs navigation" breakpoint="md" collapsible="icon" defaultCollapsed>
      <SidebarToggle
        expandedIcon={<PanelLeftCloseIcon data-slot="icon" aria-hidden="true" />}
        collapsedIcon={<PanelLeftOpenIcon data-slot="icon" aria-hidden="true" />}
      />
      <NavBrand>
        <a href="/">
          <span data-slot="icon" aria-hidden="true">
            D
          </span>
          <strong>Docs</strong>
        </a>
      </NavBrand>
      <NavGroup label="Guides">
        <NavLink href="/docs" match="exact">
          <BookOpenIcon data-slot="icon" aria-hidden="true" />
          <span>Overview</span>
        </NavLink>
        <NavLink href="/docs/getting-started">
          <CompassIcon data-slot="icon" aria-hidden="true" />
          <span>Getting started</span>
        </NavLink>
        <NavLink href="/docs/components">
          <ShapesIcon data-slot="icon" aria-hidden="true" />
          <span>Components</span>
        </NavLink>
      </NavGroup>
      <NavGroup label="Support" align="end">
        <NavLink href="/contact">
          <LifeBuoyIcon data-slot="icon" aria-hidden="true" />
          <span>Contact</span>
        </NavLink>
      </NavGroup>
    </Sidebar>
  );
}
```

Sidebars can opt into the common desktop icon rail while still using a drawer
below the responsive breakpoint. Add `SidebarToggle` to configure the rail
icons, and provide icon-plus-label nav items so the rail has a compact visual
target and the label remains available to assistive tech:

```tsx
<Sidebar collapsible="icon" breakpoint="md" aria-label="Docs navigation">
  <SidebarToggle
    expandedIcon={<PanelLeftCloseIcon data-slot="icon" aria-hidden="true" />}
    collapsedIcon={<PanelLeftOpenIcon data-slot="icon" aria-hidden="true" />}
  />
  <NavBrand>
    <a href="/">
      <span data-slot="icon" aria-hidden="true">
        D
      </span>
      <strong>Docs</strong>
    </a>
  </NavBrand>
  <NavGroup label="Guides">
    <NavLink href="/docs">
      <BookOpenIcon data-slot="icon" aria-hidden="true" />
      <span>Overview</span>
    </NavLink>
  </NavGroup>
</Sidebar>
```

For horizontal topbars, use `Navbar` with aligned groups directly:

```tsx
import { NavBrand, NavGroup, NavLink, Navbar } from "@askrjs/themes/navs";

export function PrimaryNav() {
  return (
    <Navbar aria-label="Primary navigation">
      <NavBrand>
        <a href="/">Docs</a>
      </NavBrand>
      <NavGroup align="center">
        <NavLink href="/docs">Docs</NavLink>
      </NavGroup>
      <NavGroup align="end">
        <NavLink href="/settings">Settings</NavLink>
      </NavGroup>
    </Navbar>
  );
}
```

`NavLink` uses prefix matching by default, which is useful for section links
that should stay active on child routes. Use `match="exact"` when a link
should only be current on its own path, such as a docs overview item that
should stop highlighting once the user drills into a nested page.

Use `Nav` when you need standalone route navigation patterns such as tabs or
pills without shell chrome:

```tsx
import { Nav, NavLink } from "@askrjs/themes/navs";

export function SettingsTabs() {
  return (
    <Nav aria-label="Settings sections" variant="tabs">
      <NavLink href="/settings/profile">Profile</NavLink>
      <NavLink href="/settings/billing">Billing</NavLink>
      <NavLink href="/settings/security">Security</NavLink>
    </Nav>
  );
}
```

The theme supports both canonical `askr-ui` hooks and convenient class aliases:

```html
<button data-slot="button" data-variant="primary">Save</button>
<button class="btn btn-primary">Save</button>
```

Card composition helpers such as `CardActions` live with the other surfaces in
`@askrjs/themes/surfaces`.

The default path is an admin-ready application shell: tables, settings pages,
record detail screens, and dashboard layouts should look production-ready
without custom CSS. Product-style and marketing-style shells should be composed
in userland from the generic primitives rather than expected as package recipes.

Semantic table primitives come from `@askrjs/ui`; the default theme styles the
`Table` surface through its bundled `table.css` rules.

For surface and navigation helpers:

```ts
import { Breadcrumb } from "@askrjs/themes/navs";
import { Spinner } from "@askrjs/themes/feedback";
```

For shell wrappers and chrome:

```ts
import { Header, Shell, ShellMain, ShellNav } from "@askrjs/themes/shells";
```

For theme-owned visual components:

```ts
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@askrjs/themes/surfaces";
```

For branded asset helpers:

```ts
import { GitHubLogo, GoogleLogo, MicrosoftLogo } from "@askrjs/themes/logos";
```

For app theme controls:

```tsx
import { ThemePicker, ThemeProvider, ThemeToggle } from "@askrjs/themes/theme";

export function App() {
  return (
    <ThemeProvider>
      <ThemePicker />
      <ThemeToggle lightIcon={<SunIcon />} darkIcon={<MoonIcon />} />
    </ThemeProvider>
  );
}
```

For themed controls:

```ts
import { Button, ButtonGroup, Close, InputGroup, InputGroupText } from "@askrjs/themes/controls";
```

For alert, list, and paging surfaces:

```ts
import { Alert, Badge, Card, ListGroup } from "@askrjs/themes/surfaces";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@askrjs/themes/navs";
```

Alerts stay ergonomic while still composing cleanly with theme controls:

```tsx
<Alert
  variant="info"
  title="Saved"
  description="Your changes were stored successfully."
  dismissible
  onDismiss={handleDismiss}
  actions={<Button variant="outline">Undo</Button>}
/>
```
