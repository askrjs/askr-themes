# Styling: Theming

Theming in Askr means overriding design tokens and, optionally, base component styles.

> This guide is a work in progress.

## Approach

Askr applications use a layered CSS architecture:

```
reset.css         — baseline resets
tokens.css        — design tokens (from askr-themes or custom)
styles/base/      — typography and foundational primitives
styles/actions/   — button and toggle controls
styles/forms/     — inputs, labels, fields, and form controls
styles/display/   — cards, badges, progress, separators, and status display
styles/navigation/ — menus, tabs, breadcrumbs, and pagination
styles/disclosure/ — accordion and collapsible patterns
styles/overlays/  — dialogs, popovers, toasts, and tooltips
styles/data/      — data-heavy views such as tables
styles/shell/     — global shell theme values and product/marketing shells
styles/layout/    — layout primitives and responsive page structure
components.css    — component-level overrides
```

Each layer can be replaced or extended independently.

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
`@askrjs/askr-themes/components`: `AppShell`, `PageHeader`, `EmptyState`,
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
