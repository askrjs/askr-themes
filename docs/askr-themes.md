# Styling: askr-themes

`@askrjs/askr-themes` provides the canonical default visual theme for Askr applications.

## What askr-themes is

askr-themes is an optional styling layer. It provides:

- Design tokens (CSS custom properties)
- Base component styles that pair with `askr-ui`
- Visual-only composition primitives such as Box, Stack, Inline, Cluster, Grid,
  Container, Section, and Spacer
- Theme-scoped wrapper modules for visual-only layouts
- Theme-owned visual components when no headless primitive is needed

It does not own runtime behavior or accessibility logic. When it exports a
component wrapper, that wrapper composes an existing `askr-ui` primitive and
applies the default theme styles for that visual contract.

## Installation

```bash
npm install @askrjs/askr-themes
```

Import once at your app entry point:

```ts
import "@askrjs/askr-themes/default";
```

You can also import default themed components from the app-facing component
barrel:

```ts
import {
  Badge,
  Button,
  Divider,
  Grid,
  Stack,
} from "@askrjs/askr-themes/components";
```

Layout wrappers also live here because they are visual composition, not
behavior:

```ts
import {
  SidebarLayout,
  TopbarLayout,
} from "@askrjs/askr-themes/components";
```

Or import a theme-owned visual component directly:

```ts
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@askrjs/askr-themes/components";
```

Theme controls are also available from the same entrypoint. `ThemeToggle`
does not ship icons; pass your own visual content:

```tsx
import {
  ThemePicker,
  ThemeProvider,
  ThemeToggle,
} from "@askrjs/askr-themes/components";

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
@import "@askrjs/askr-themes/default";
```

## When to use askr-themes

Use `askr-themes` when you want the standard Askr visual language without writing your own
design token layer.

Skip `askr-themes` when you have your own design system. `askr-ui` components work without
`askr-themes` — supply your own CSS.

## See also

- [Tokens](./tokens.md)
- [Theming](./theming.md)
- [UI: askr-ui](../ui/askr-ui.md)
