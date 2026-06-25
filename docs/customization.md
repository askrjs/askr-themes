# Safe Customization

The customization path is intentionally small:

1. Override tokens for broad visual decisions.
2. Use component props when they express semantic state or behavior.
3. Use stable `data-slot` hooks for app-scoped CSS.
4. Use documented alias classes when authoring raw HTML.
5. Use `class` or `style` for rare one-off CSS.

Do not recreate CSS as props. Layout belongs in `Block`; visual components keep
only the semantic controls that developers use frequently.

## Tokens First

Tokens are the preferred way to change the look of the whole app or product
area.

```css
:root {
  --ak-color-primary: #0ea5e9;
  --ak-radius-md: 8px;
  --ak-density-control-height-md: 2.375rem;
}
```

Use token overrides for color, radius, typography, spacing rhythm, elevation,
focus rings, motion, z-index, and common density. Use component selectors only
when the app needs a local exception.

## Component Props Second

Use props when they describe meaning:

```tsx
<Button variant="primary" size="sm">Save</Button>
<Badge variant="success">Live</Badge>
<NavLink href="/settings" match="exact">Settings</NavLink>
<Navbar collapseAt="md" aria-label="Primary">...</Navbar>
```

Avoid props that only mirror CSS:

```tsx
// Do not add APIs like this to themed components.
<Card width="lg" density="compact" shadowColor="blue" />
```

Use `Block` around the component for layout:

```tsx
<Block maxWidth="sm" width="full">
  <Card>...</Card>
</Block>
```

## Slot CSS Third

Use slots when a customization is app-specific but should survive component
markup changes.

```css
.settings-page :where([data-slot="card"]) {
  border-color: var(--ak-color-border-strong);
}

```

Compose card interiors with `Block`, headings, text, and actions. Keep selectors
app-scoped and low-specificity. Avoid child-order selectors:

```css
/* Avoid: brittle child order. */
.settings-page .card > div:first-child {
  padding-bottom: 0;
}
```

## Alias Classes

Alias classes exist only where they are intentionally supported for raw HTML
ergonomics. They are not a second component API.

Common aliases:

- Buttons: `btn`, `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`,
  `btn-destructive`, `btn-link`, `btn-sm`, `btn-lg`, `btn-icon`, `btn-close`.
- Forms: `input`, `input-sm`, `input-lg`, `textarea`, `textarea-sm`,
  `textarea-lg`, `label`, `field`, `field-hint`, `field-error`,
  `input-group`, `input-group-text`.
- Surfaces: `card`, `card-raised`, `alert`, `alert-info`, `alert-success`,
  `alert-warning`, `alert-danger`, `badge`, `badge-success`,
  `badge-warning`, `badge-danger`, `badge-info`.
- Navigation and overlays: `nav`, `nav-item`, `navbar-item`,
  `dropdown-trigger`, `dropdown-content`, `dropdown-item`,
  `dropdown-label`, `dropdown-separator`.

Raw HTML example:

```html
<button class="btn btn-primary btn-sm">Save</button>
<section class="card">
  <h3>Usage</h3>
  <div>Current workspace metrics.</div>
</section>
```

Component code should usually import the themed component instead:

```tsx
<Button variant="primary" size="sm">
  Save
</Button>
```

## Component Hooks

### Core

- `Block`, `Container`, `Page`, and `PageHeader` handle layout and page
  structure. Customize layout through `Block` props before writing CSS.
- Use `page-header-actions` for wrapping or aligning action groups.
- Use `container` when app sections need different max-width behavior.

```css
.reports-page :where([data-slot="container"]) {
  max-width: 88rem;
}
```

### Navbar

- Use `NavBrand` first.
- Use `NavLink` for app routes.
- Use `NavItem` for external or manual links.
- Use `NavDropdown` for simple single-level menus.
- Add `collapseAt` only when inline content needs to collapse.

```css
.app-header :where([data-slot="navbar-toggle"]) {
  margin-left: auto;
}
```

### Forms

```css
.account-form :where([data-slot="field"]) {
  gap: var(--ak-space-xs);
}

.account-form :where([data-slot="input"][aria-invalid="true"]) {
  box-shadow: 0 0 0 1px var(--ak-color-danger);
}
```

Do not add layout props to `Input`, `Select`, `Checkbox`, or `Switch`. Put those
controls inside `Block`, `Field`, or `InputGroup`.

### Surfaces

```css
.usage-grid :where([data-slot="card"]) {
  min-height: 10rem;
}

.usage-grid :where([data-slot="skeleton"]) {
  height: 1rem;
  border-radius: var(--ak-radius-sm);
}
```

Use `Badge` for visual labels and `Alert` for inline feedback. Keep removable
chips local until a stable interactive contract emerges.

### Overlays

```css
.account-menu :where([data-slot="dropdown-content"]) {
  min-width: 14rem;
}

.profile-dialog :where([data-slot="dialog-content"]) {
  width: min(32rem, calc(100vw - 2rem));
}
```

Do not target overlay portals or positioning wrappers. The public surface is
the trigger/content/item/title/description slots.

### Theme Controls

```css
.auth-header :where([data-slot="theme-toggle-content"]) {
  display: inline-flex;
  align-items: center;
}
```

Keep global theme controls visible in simple headers. Avoid putting the only
theme toggle inside a collapsed navigation panel.

## Escape Hatches

Use `class` for reusable app styling:

```tsx
<Card class="billing-summary">...</Card>
```

Use `style` for one-off dynamic values:

```tsx
<Skeleton style={{ width: `${loadingWidth}px` }} />
```

If a customization appears repeatedly across apps, consider whether it is a
semantic component behavior. If it is only visual CSS, keep it in app CSS or
tokens.
