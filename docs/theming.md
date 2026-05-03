# Styling: Theming

Theming in `@askrjs/themes` means overriding design tokens and, when needed,
layering app-specific CSS over the default component selectors.

Charts are intentionally out of scope here. Use `@askrjs/charts` as the sibling
package for CSS-first chart visuals and lightweight trend approximations.

## Layer Model

The default theme is split into replaceable CSS layers:

```text
reset.css          - baseline resets
tokens.css         - design tokens
styles/base/       - typography and foundational primitives
styles/actions/    - buttons and toggle controls
styles/forms/      - inputs, labels, and form controls
styles/display/    - cards, badges, progress, separators, aspect ratios, tables, and status display
styles/navigation/ - menus, tabs, and breadcrumbs
styles/disclosure/ - accordion and collapsible patterns
styles/overlays/   - dialogs, popovers, toasts, and tooltips
styles/shell/      - app shell theme values
styles/layout/     - layout primitives and responsive page structure
components.css     - component-level composition defaults
```

Import the full default theme when you want the standard admin UI baseline:

```ts
import "@askrjs/themes/default";
```

## Token Overrides

Override tokens after importing the default theme:

```css
:root {
  --ak-color-primary: #0ea5e9;
  --ak-radius-md: 8px;
  --ak-density-control-height-md: 2.375rem;
}
```

Use tokens first. Add component-level CSS only when a semantic token is not
specific enough for the app surface.

## Dark Mode

Theme variants are ordinary CSS scopes. The default components read tokens from
the active scope:

```css
[data-theme="dark"] {
  --ak-color-bg: #0f172a;
  --ak-color-text: #f1f5f9;
  --ak-color-surface: #111827;
}
```

## Selector Contract

`data-slot` is the canonical selector contract for package components. The
default theme also provides a small set of class aliases for raw HTML.
Theme-owned wrappers such as `Breadcrumb`, `Spinner`, and `AccessibleIcon` stay
thin, while shell chrome components such as `Header`, `Navbar`,
`SidebarLayout`, and `TopbarLayout` provide the app frame. Recipe shells like
marketing or product pages should be composed in userland from these
primitives rather than shipped as dedicated theme exports.

Layout wrappers such as `AspectRatio` stay in the same visual layer and keep
their job limited to presentation.

```html
<button data-slot="button" data-variant="primary">Save</button>
<button class="btn btn-primary">Save</button>
```

When extending styles, group aliases with their canonical selectors:

```css
:where(.btn-primary, [data-slot="button"][data-variant="primary"]) {
  background: var(--ak-color-primary);
}
```

## See Also

- [Tokens](./tokens.md)
- [askr-themes](./askr-themes.md)
