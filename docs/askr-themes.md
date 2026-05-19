# Styling: askr-themes

`@askrjs/themes` provides the canonical default visual theme for Askr admin and internal-tool applications.
It pairs with `@askrjs/charts`, which owns the lightweight charting surface.

## What askr-themes is

askr-themes is an optional styling layer. It provides:

- Curated entrypoints such as `theme`, `layouts`, `controls`, `surfaces`,
  `feedback`, `shells`, and `navs`
- Theme controls and design tokens
- Visual primitives such as `Box`, `Block`, `Stack`, `Inline`, `Flex`,
  `Container`, `Section`, `Spacer`, and `AspectRatio`
- Semantic `askr-ui` styling, starting with `Button`, `ButtonGroup`, `Close`,
  and `InputGroup`
- Surface helpers such as `Alert`, `Badge`, `Card`, `CardActions`,
  `ListGroup`, `Separator`, and `Skeleton`
- Form helpers such as `Field`, `FieldHint`, and `FieldError`
- Feedback helpers such as `EmptyState` and `Spinner`
- Shell and navigation chrome such as `Header`, `Navbar`, `Nav`, `NavItem`,
  `NavLink`, `NavGroup`, `NavBrand`, `Pagination`, `Breadcrumb`, `Shell`,
  `ShellNav`, and `ShellMain`
- App-specific asset helpers belong in userland so the package stays focused
- Chart-adjacent shell styling, but not chart rendering itself
- A small, opinionated foundation of primitives that look good out of the box,
  stay easy to override with tokens, and stop short of app-specific recipes
  that belong in userland

It does not own runtime behavior or accessibility logic. When it exports a
component wrapper, that wrapper composes an existing `askr-ui` primitive and
applies the default theme styles for that visual contract.

See [Architecture](./architecture.md) for the package boundary between
`@askrjs/askr`, `@askrjs/ui`, and `@askrjs/themes`.

## When to reach for what

- Start with `@askrjs/themes/theme` when you need tokens, theme switching, or
  theme state helpers.
- Use `@askrjs/themes/layouts` for layout composition and page structure.
- Use `@askrjs/themes/controls` for themed control exports such as `Button`.
- Use `@askrjs/themes/surfaces` for generic visual surfaces and display
  helpers.
- Use `@askrjs/themes/feedback` for loading, empty, and async feedback
  primitives.
- Use `@askrjs/themes/shells` for the overall app frame and shell layout.
- Use `@askrjs/themes/navs` for navigational building blocks such as
  `Navbar`, `Nav`, `NavLink`, and `Breadcrumb`.
- Keep app-specific asset helpers in userland so the package stays focused.

## Layout primitive roles

These primitives are intentionally different. They are not four names for the
same job.

- `Container` controls readable page width and horizontal gutters. Use it when
  content should be centered or constrained to a predictable measure.
- `Section` controls vertical page rhythm and semantic grouping. Use it when a
  page needs clear major regions such as hero, filters, results, or settings
  groups.
- `Stack` controls one-dimensional vertical flow between siblings. Use it for
  card internals, form fields, prose blocks, and other content that should read
  top to bottom.
- `Block` controls responsive two-dimensional wrapping. Use it for groups of
  cards, metrics, tiles, or panels that should auto-fit into columns without
  hand-authoring breakpoints.

The mental model is straightforward: `Container` sets width, `Section` sets
page rhythm, `Stack` sets vertical flow, and `Block` sets responsive wrapping.
They compose well because each primitive owns a different concern.

## Installation

```bash
npm install @askrjs/themes
```

Import once at your app entry point:

```ts
import "@askrjs/themes/default";
```

You can also import from the focused subpaths directly:

```ts
import { Block, Container, Flex, Section, Stack } from "@askrjs/themes/layouts";
```

For shell chrome:

```ts
import { Header, Shell, ShellMain, ShellNav } from "@askrjs/themes/shells";
```

For navigation chrome:

```ts
import {
  Nav,
  NavBrand,
  NavGroup,
  Navbar,
  NavLink,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@askrjs/themes/navs";
```

For navigation chrome, prefer the typed grouping props over raw data
attributes. Use `align` for horizontal bars and for vertical bottom grouping:

````tsx
import {
  NavBrand,
  NavGroup,
  NavLink,
  Sidebar,
  SidebarToggle,
} from "@askrjs/themes/navs";

export function AppChrome() {
  return (
    <Sidebar aria-label="Workspace navigation" breakpoint="md" collapsible="icon">
      <SidebarToggle
        expandedIcon={<span data-slot="icon" aria-hidden="true">E</span>}
        collapsedIcon={<span data-slot="icon" aria-hidden="true">C</span>}
      />
      <NavBrand>
        <a href="/">
          <span data-slot="icon" aria-hidden="true">W</span>
          <strong>Workspace</strong>
        </a>
      </NavBrand>
      <NavGroup label="Primary">
        <NavLink href="/dashboard" match="exact">
          <span data-slot="icon" aria-hidden="true">O</span>
          <span>Overview</span>
        </NavLink>
        <NavLink href="/dashboard">
          <span data-slot="icon" aria-hidden="true">D</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink href="/settings">
          <span data-slot="icon" aria-hidden="true">S</span>
          <span>Settings</span>
        </NavLink>
      </NavGroup>
      <NavGroup label="Secondary" align="end">
        <NavLink href="/help">
          <span data-slot="icon" aria-hidden="true">H</span>
          <span>Help</span>
        </NavLink>
      </NavGroup>
    </Sidebar>
  );
}
```tsx
<Sidebar collapsible="icon" breakpoint="md" aria-label="Docs navigation">
  <SidebarToggle
    expandedIcon={<span data-slot="icon" aria-hidden="true">E</span>}
    collapsedIcon={<span data-slot="icon" aria-hidden="true">C</span>}
  />
</Sidebar>
````

Use `Nav` for standalone navigation patterns where you want the themed route
link treatment without the shell-specific layout responsibilities of `Navbar`.
`Nav` currently supports `default`, `tabs`, and `pills` variants.

Theme controls are also available from the same entrypoint. `ThemeToggle`
does not ship icons; pass your own visual content:

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

Or in CSS:

```css
@import "@askrjs/themes/default";
```

The default theme is designed to supply admin and internal-tool surfaces while
leaving the overall app frame in userland. Use the package for primitives,
tokens, and shell chrome, then compose any app-specific page helpers locally.

The visual bar is intentionally product-app oriented: compact controls,
precise spacing, readable type, resilient long labels, and equal light/dark
polish from narrow mobile widths through desktop. Use `visual-check.html` as
the manual audit page for default theme work; the checklist is documented in
[Theming](./theming.md#visual-quality-standard).

For responsive composition, use `Block`. It is the intended default for groups
of cards or content blocks that should wrap naturally with a small API surface.

Typical composition looks like this:

```tsx
import { Block, Container, Section, Stack } from "@askrjs/themes/layouts";

export function ExamplePage() {
  return (
    <Section size="3">
      <Container size="3">
        <Stack gap="lg">
          <Block size="md" gap="4">
            <article>Alpha</article>
            <article>Beta</article>
            <article>Gamma</article>
          </Block>
        </Stack>
      </Container>
    </Section>
  );
}
```

In that example, `Section` defines the page band, `Container` keeps the content
measure readable, `Stack` spaces the vertical flow, and `Block` handles the
responsive card group.

`data-slot` is the canonical styling contract from `askr-ui`, and
`askr-themes` layers optional unprefixed aliases over it for ergonomic raw HTML:

```html
<button data-slot="button" data-variant="primary">Save</button>
<button class="btn btn-primary">Save</button>
<nav class="pagination">
  <ul class="pagination-list">
    <li class="page-item"><a class="page-link" href="/docs">1</a></li>
  </ul>
</nav>
```

Those aliases are selective on purpose. The common wrapper surfaces emit the
matching names by default, so Bootstrap-familiar markup and askr's canonical
slots can coexist cleanly in the same app.

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
