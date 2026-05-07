# @askrjs/themes

Default theme tokens, styles, and visual components for askr-ui applications.

## Contents

- [Overview](./askr-themes.md) - What askr-themes is and when to use it
- [Tokens](./tokens.md) - Design token reference and overrides
- [Theming](./theming.md) - Layered CSS architecture and dark mode

## Quick start

```bash
npm install @askrjs/themes
```

```ts
import "@askrjs/themes/default";
```

For reusable shell chrome and visual composition:

```ts
import {
  AccessibleIcon,
  AspectRatio,
  Badge,
  Button,
  EmptyState,
  Flex,
  Header,
  NavBrand,
  NavGroup,
  Navbar,
  NavItem,
  NavLink,
  SidebarLayout,
  Skeleton,
  Stack,
  TopbarLayout,
} from "@askrjs/themes/components";
```

`Navbar` supports both topbar and sidebar composition. Prefer `align` for
horizontal grouping and `placement` for vertical top or bottom grouping:

```tsx
import { NavBrand, NavGroup, NavLink, Navbar } from "@askrjs/themes/components";

export function DocsSidebar() {
  return (
    <Navbar orientation="vertical" aria-label="Docs navigation">
      <NavBrand>
        <a href="/">Docs</a>
      </NavBrand>
      <NavGroup label="Guides">
        <NavLink href="/docs/getting-started">Getting started</NavLink>
        <NavLink href="/docs/components">Components</NavLink>
      </NavGroup>
      <NavGroup label="Support" placement="bottom">
        <NavLink href="/contact">Contact</NavLink>
      </NavGroup>
    </Navbar>
  );
}
```

The theme supports both canonical `askr-ui` hooks and convenient class aliases:

```html
<button data-slot="button" data-variant="primary">Save</button>
<button class="btn btn-primary">Save</button>
```

The default path is an admin-ready application shell: tables, settings pages,
record detail screens, and dashboard layouts should look production-ready
without custom CSS. Product-style and marketing-style shells should be composed
in userland from the generic primitives rather than expected as package recipes.

Semantic table primitives come from `@askrjs/ui`; the default theme styles the
`Table` surface through its bundled `table.css` rules.

For theme-owned visual wrappers:

```ts
import { AccessibleIcon, Breadcrumb, Spinner } from "@askrjs/themes/components";
```

For visual-only layout wrappers and shell chrome:

```ts
import { Header, SidebarLayout, TopbarLayout } from "@askrjs/themes/components";
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
} from "@askrjs/themes/components";
```

For app theme controls:

```tsx
import { ThemePicker, ThemeProvider, ThemeToggle } from "@askrjs/themes/components";

export function App() {
  return (
    <ThemeProvider>
      <ThemePicker />
      <ThemeToggle lightIcon={<SunIcon />} darkIcon={<MoonIcon />} />
    </ThemeProvider>
  );
}
```
