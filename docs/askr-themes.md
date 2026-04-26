# Styling: askr-themes

`@askrjs/askr-themes` provides the canonical default visual theme for Askr applications.

## What askr-themes is

askr-themes is an optional styling layer. It provides:

- Design tokens (CSS custom properties)
- Base component styles that pair with `askr-ui`
- Visual-only composition primitives such as Box, Stack, Inline, Cluster, Grid,
  Container, Section, and Spacer
- Product SaaS scaffold primitives such as AppShell, PageHeader, EmptyState,
  FormSection, and SettingsSection
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
  AppShell,
  Badge,
  Button,
  Divider,
  EmptyState,
  FormSection,
  Grid,
  PageHeader,
  SettingsSection,
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

The default theme is designed to scaffold product SaaS screens without app CSS:
pair `AppShell` with `PageHeader`, `Grid`, `Card`, `FormSection`, and
`EmptyState`, then customize the result by overriding semantic `--ak-*` tokens.

## Product app scaffold

```tsx
import "@askrjs/askr-themes/default";
import {
  AppShell,
  Button,
  Card,
  CardContent,
  EmptyState,
  FormSection,
  PageHeader,
  SettingsSection,
  Stack,
} from "@askrjs/askr-themes/components";

export function App() {
  return (
    <AppShell
      sidebar={<Stack gap="2">Navigation</Stack>}
      topbar={
        <PageHeader
          title="Acme Console"
          description="Operational overview"
          actions={<Button variant="primary">New project</Button>}
        />
      }
    >
      <Stack gap="5">
        <PageHeader eyebrow="Dashboard" title="Good morning" />
        <Card>
          <CardContent>Metrics, tables, or charts go here.</CardContent>
        </Card>
        <FormSection title="Profile" description="Workspace defaults.">
          Form fields go here.
        </FormSection>
        <SettingsSection title="Danger zone" description="Protected actions.">
          <EmptyState title="No destructive actions configured" />
        </SettingsSection>
      </Stack>
    </AppShell>
  );
}
```

Keep narrow recipes as composition: an auth screen is `Card` plus `FormSection`;
a table page is `PageHeader` plus the `askr-ui` data table pattern inside a
`Card` or surface. Those recipes do not need first-class wrappers until they
prove reusable across several apps.

`data-slot` is the canonical styling contract from `askr-ui`, and
`askr-themes` layers optional unprefixed aliases over it for ergonomic raw HTML:

```html
<button data-slot="button" data-variant="primary">Save</button>
<button class="btn btn-primary">Save</button>
```

Scaffold components use plain classes for styling (`.app-shell`,
`.page-header`, `.form-section`) while global design tokens keep the `--ak-*`
prefix. Class aliases are intentionally selective; prefer tokens and canonical
data hooks for deeper customization.

## When to use askr-themes

Use `askr-themes` when you want the standard Askr visual language without writing your own
design token layer.

Skip `askr-themes` when you have your own design system. `askr-ui` components work without
`askr-themes` — supply your own CSS.

## See also

- [Tokens](./tokens.md)
- [Theming](./theming.md)
- [UI: askr-ui](../ui/askr-ui.md)
