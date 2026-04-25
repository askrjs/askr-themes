# Styling: askr-themes

`@askrjs/askr-themes` provides the canonical default visual theme for Askr applications.

## What askr-themes is

askr-themes is an optional styling layer. It provides:

- Design tokens (CSS custom properties)
- Base component styles that pair with `askr-ui`
- Layout utility classes
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

You can also import default themed layout wrappers directly when you want the
default layout styling and the headless layout primitive together:

```ts
import { SidebarLayout } from "@askrjs/askr-themes/default/sidebar-layout";
import { TopbarLayout } from "@askrjs/askr-themes/default/topbar-layout";
```

Or import a theme-owned visual component directly:

```ts
import { Card, CardContent, CardHeader, CardTitle } from "@askrjs/askr-themes/default/card";
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
