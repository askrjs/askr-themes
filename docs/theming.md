# Styling: Theming

Theming in Askr means overriding design tokens and, optionally, base component styles.

> This guide is a work in progress.

## Approach

Askr applications use a layered CSS architecture:

```
reset.css         â€” baseline resets
tokens.css        â€” design tokens (from askr-themes or custom)
styles/base/      â€” typography and foundational primitives
styles/actions/   â€” button and toggle controls
styles/forms/     â€” inputs, labels, fields, and form controls
styles/display/   â€” cards, badges, progress, separators, and status display
styles/navigation/ â€” menus, tabs, breadcrumbs, and pagination
styles/disclosure/ â€” accordion and collapsible patterns
styles/overlays/  â€” dialogs, popovers, toasts, and tooltips
styles/data/      â€” data-heavy views such as tables
styles/shell/     â€” global shell theme values and app-level shell patterns
styles/layout/    â€” layout primitives and responsive page structure
components.css    â€” component-level overrides
```

Each layer can be replaced or extended independently.

## Default theme baseline

The default theme is optimized for admin and internal tools.

- neutral grayscale foundation with one accent color
- subtle borders before heavy elevation
- compact controls and layout density
- small, consistent radius values
- tight spacing and disciplined typography
- production-ready defaults over broad stylistic flexibility

If you are building a highly branded marketing site, expect to override the
theme aggressively or supply a custom one.

## Token overrides

Override tokens in your app CSS after importing the default theme:

```css
:root {
  --ak-color-primary: #0ea5e9;
  --ak-radius-md: 8px;
  --ak-density-control-height-md: 2.375rem;
}
```

## Dark mode

Token overrides under a `[data-theme="dark"]` selector:

```css
[data-theme="dark"] {
  --ak-color-bg: #0f172a;
  --ak-color-text: #f1f5f9;
  --ak-color-surface: #111827;
}
```

## App scaffolds

The default theme includes low-level app patterns through
`@askrjs/themes/components`: `AppShell`, `PageHeader`, `EmptyState`,
`FormSection`, and `SettingsSection`. They are visual composition only; behavior
still belongs to `askr-ui`.

`data-slot` remains the canonical selector contract because it is emitted by
`askr-ui`. `askr-themes` also ships optional daisy-like class aliases for common
raw HTML and scaffold authoring:

```html
<button data-slot="button" data-variant="primary">Save</button>
<button class="btn btn-primary">Save</button>

<header data-slot="page-header">
  <div data-slot="page-header-content">
    <h1 data-slot="page-header-title">Dashboard</h1>
  </div>
</header>

<header class="page-header">
  <div class="page-header-content">
    <h1 class="page-header-title">Dashboard</h1>
  </div>
</header>
```

Theme-owned scaffold components expose plain kebab-case classes, such as
`.app-shell`, `.page-header`, `.empty-state`, `.form-section`, and
`.settings-section`, and they now emit matching canonical `data-slot` hooks for
the same public parts. Group public aliases with their canonical selectors in a
single low-specificity rule:

```css
:where(.btn-primary, [data-slot="button"][data-variant="primary"]) {
  background: var(--ak-color-primary);
}

:where(.page-header, [data-slot="page-header"]) {
  gap: var(--ak-space-4);
}
```

Tokens keep the `--ak-*` prefix because they are global. Variant, size, and
state selectors stay in data attributes, with class aliases only for approved
high-value shortcuts.

Use tokens first for customization. Reach for component CSS overrides only when
the semantic tokens are not expressive enough.

## See also

- [Tokens](./tokens.md)
- [askr-themes](./askr-themes.md)

