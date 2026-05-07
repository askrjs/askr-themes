# Styling: askr-themes

`@askrjs/themes` provides the canonical default visual theme for Askr admin and internal-tool applications.
It pairs with `@askrjs/charts`, which owns the lightweight charting surface.

## What askr-themes is

askr-themes is an optional styling layer. It provides:

- Theme controls and design tokens
- Visual primitives such as `Box`, `Stack`, `Inline`, `Flex`, `Grid`,
  `Container`, `Section`, `Spacer`, and `AspectRatio`
- Semantic `askr-ui` styling, starting with `Button`
- Theme-owned wrappers such as `Breadcrumb`, `Spinner`, and `AccessibleIcon`
- Shell and navigation chrome such as `Header`, `Navbar`, `NavItem`,
  `NavLink`, `NavGroup`, `NavBrand`, `SidebarLayout`, and `TopbarLayout`
- Chart-adjacent shell styling, but not chart rendering itself

It does not own runtime behavior or accessibility logic. When it exports a
component wrapper, that wrapper composes an existing `askr-ui` primitive and
applies the default theme styles for that visual contract.

## When to reach for what

- Start with theme controls when you need tokens, theme switching, or default
  button styling.
- Use visual primitives for layout and surface composition.
- Use wrappers like `Breadcrumb`, `Spinner`, and `AccessibleIcon` when you want a theme-owned
  presentation around a core semantic primitive.
- Use shell and navigation chrome when you are composing the overall frame of
  an application. `Header` belongs here because it frames the page shell,
  while `Navbar`, `SidebarLayout`, and `TopbarLayout` define the surrounding
  application chrome.

## Installation

```bash
npm install @askrjs/themes
```

Import once at your app entry point:

```ts
import "@askrjs/themes/default";
```

You can also import default themed components from the app-facing component
barrel:

```ts
import {
  Badge,
  Button,
  Breadcrumb,
  EmptyState,
  Flex,
  Grid,
  Header,
  NavBrand,
  NavGroup,
  Navbar,
  NavItem,
  NavLink,
  Spinner,
  Stack,
} from "@askrjs/themes/components";
```

Layout wrappers also live here because they are visual composition, not
behavior:

```ts
import { SidebarLayout, TopbarLayout } from "@askrjs/themes/components";
```

For navigation chrome, prefer the typed grouping props over raw data
attributes. Use `align` for horizontal bars and `placement` for vertical
top-or-bottom grouping:

```tsx
import { NavBrand, NavGroup, NavLink, Navbar } from "@askrjs/themes/components";

export function AppChrome() {
  return (
    <Navbar orientation="vertical" aria-label="Workspace navigation">
      <NavBrand>
        <a href="/">Workspace</a>
      </NavBrand>
      <NavGroup label="Primary">
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/settings">Settings</NavLink>
      </NavGroup>
      <NavGroup label="Secondary" placement="bottom">
        <NavLink href="/help">Help</NavLink>
      </NavGroup>
    </Navbar>
  );
}
```

Theme controls are also available from the same entrypoint. `ThemeToggle`
does not ship icons; pass your own visual content:

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

Or in CSS:

```css
@import "@askrjs/themes/default";
```

The default theme is designed to supply admin and internal-tool surfaces while
leaving the overall app frame in userland. Use the package for primitives,
tokens, and shell chrome, then compose any app-specific page helpers locally.

`data-slot` is the canonical styling contract from `askr-ui`, and
`askr-themes` layers optional unprefixed aliases over it for ergonomic raw HTML:

```html
<button data-slot="button" data-variant="primary">Save</button>
<button class="btn btn-primary">Save</button>
```

Pattern primitives keep their plain classes for raw HTML ergonomics
(`.page-header`) and also emit matching canonical `data-slot` hooks. `Header`
is the public shell chrome component; the shell stylesheet uses `.page-header`
as its internal style hook for that surface. Global design tokens keep the
`--ak-*` prefix. Class aliases are intentionally selective; prefer tokens and
canonical data hooks for deeper customization.

## When to use askr-themes

Use `askr-themes` when you want the standard Askr admin visual language without
writing your own design token layer.

Skip `askr-themes` when you have your own design system. `askr-ui` components
work without `askr-themes` - supply your own CSS.

## See also

- [Tokens](./tokens.md)
- [Theming](./theming.md)
- [UI: askr-ui](https://github.com/askrjs/askr-ui/tree/main/docs/askr-ui.md)
