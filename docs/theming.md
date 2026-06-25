# Styling: Theming

Theming in `@askrjs/themes` means overriding design tokens and, when needed,
layering app-specific CSS over the default component selectors.

Charts are intentionally out of scope here. Use `@askrjs/charts` as the sibling
package for CSS-first chart visuals and lightweight trend approximations.

## Layer Model

The default theme ships as a single import graph rooted at
[src/themes/default/index.css](../src/themes/default/index.css). The ordered
layers below match that file:

```text
tokens.css
styles/base/reset.css
styles/base/typography.css
styles/base/icon.css
styles/base/utilities.css
styles/layout/layout.css
styles/layout/block.css
styles/layout/patterns.css
styles/layout/aspect-ratio.css
styles/shell/header.css
styles/shell/navbar.css
styles/shell/sidebar.css
styles/actions/button.css
styles/actions/button-group.css
styles/actions/toggle.css
styles/actions/toggle-group.css
styles/display/alert.css
styles/forms/input.css
styles/forms/input-group.css
styles/forms/textarea.css
styles/forms/form.css
styles/forms/field.css
styles/forms/checkbox.css
styles/forms/switch.css
styles/forms/radio-group.css
styles/forms/select.css
styles/forms/slider.css
styles/forms/label.css
styles/display/card.css
styles/display/list-group.css
styles/display/progress.css
styles/display/progress-circle.css
styles/display/badge.css
styles/display/skeleton.css
styles/display/avatar.css
styles/display/separator.css
styles/display/table.css
styles/display/scroll-area.css
styles/display/spinner.css
styles/display/coverage.css
styles/navigation/breadcrumb.css
styles/navigation/nav.css
styles/navigation/pagination.css
styles/navigation/menu.css
styles/navigation/menubar.css
styles/disclosure/accordion.css
styles/disclosure/collapsible.css
styles/overlays/alert-dialog.css
styles/overlays/dropdown.css
styles/overlays/toast.css
styles/overlays/dialog.css
styles/overlays/popover.css
styles/overlays/hover-card.css
styles/overlays/tooltip.css
```

Import the full default theme when you want the standard admin UI baseline:

```ts
import "@askrjs/themes/default";
```

## Cat Presets

The optional cat preset layer adds five curated product palettes without
duplicating component CSS. Import it after the default theme, then select a
preset with `data-theme` or a custom `ThemeProvider` option:

```css
@import "@askrjs/themes/default";
@import "@askrjs/themes/presets";
```

```html
<html data-theme="tabby"></html>
```

```tsx
import {
  CAT_THEME_NAMES,
  CAT_THEME_OPTIONS,
  ThemePicker,
  ThemeProvider,
} from "@askrjs/themes/theme";

export function AppTheme({ children }: { children?: unknown }) {
  return (
    <ThemeProvider defaultTheme="tabby" themes={CAT_THEME_OPTIONS}>
      <ThemePicker />
      {children}
    </ThemeProvider>
  );
}
```

Use `CAT_THEME_NAMES` for compact toggles that cycle only through the preset
family.

| Preset   | Use when                                                                    |
| -------- | --------------------------------------------------------------------------- |
| `tabby`  | You want a warm neutral SaaS/admin baseline close to the default density.   |
| `ginger` | You want a restrained amber/copper accent for energetic operations screens. |
| `tuxedo` | You want a crisp high-contrast dark product frame.                          |
| `calico` | You want a balanced multi-accent dashboard palette for status-heavy UIs.    |
| `torty`  | You want a deep warm dark surface for dense, long-lived workspaces.         |

Presets primarily override the semantic color surface. Dark presets may also
tune elevation tokens for contrast, while component selectors, app chrome,
density, radius, spacing, and responsive behavior continue to come from the
default theme contract.

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
See [Architecture](./architecture.md) for the package boundary between
`@askrjs/askr`, `@askrjs/ui`, and `@askrjs/themes`.
The public package surface is organized into curated entrypoints rather than a
generic catch-all: use `core` for structure, `navs` for breadcrumb/standalone
nav/pagination, and `theme`, `controls`, `surfaces`, `feedback`, or `overlays`
for the matching visual or behavioral family.
Use the curated theme entrypoints such as `controls`, `surfaces`, `feedback`,
and `navs` for styled components such as Button, ButtonGroup, Close,
InputGroup, Field, Alert, ListGroup, Pagination, Badge, Card, CardActions,
AspectRatio, Spinner, and Skeleton.
`Button` comes from `@askrjs/ui`; `@askrjs/themes` re-exports and styles it,
while wrappers like `ButtonGroup`, `Close`, `Field`, and `InputGroup` stay
theme-owned because they are visual composition only.
The wrappers intentionally emit familiar alias classes for the common app
surfaces they own, so the DOM stays easy to target with either `data-slot`
hooks or names like `alert`, `btn-group`, `btn-close`, `card-actions`,
`field`, `field-hint`, `field-error`, `input-group`, `list-group`, and
`pagination`.
Feedback helpers such as `Spinner` and nav helpers such as `Breadcrumb` stay
thin. Structural chrome components such as `Header`, `Main`, `Section`,
`Aside`, `Sidebar`, `Navbar`, `NavBrand`, `NavDropdown`, `NavGroup`, `NavLink`,
and `NavItem` are semantic presets built on `Block`; they do not introduce
independent layout behavior. Recipe layouts like marketing, product, sidebar,
split, or form pages should be composed in userland from these primitives
rather than shipped as dedicated theme exports.

Density modifiers are available on the shared control classes, including
`btn-sm`, `btn-lg`, `input-sm`, `input-lg`, `textarea-sm`, `textarea-lg`, and
`select-trigger-sm` / `select-trigger-lg`.

For structural chrome, keep the API intent explicit:

- Use `Block` when you need a wrapper.
- Use `Container` when content needs page-width constraints and gutters.
- Use `Header`, `Main`, `Section`, `Aside`, `Sidebar`, and `Navbar` for semantic readability.
- Put `NavBrand` first in `Navbar`; add `collapseAt` when links should collapse behind a menu.
- Use `NavGroup title` when a navigation section needs a visible heading.
- Use `NavDropdown` for simple single-level menus.
- Use `NavLink` for app routes and `NavItem active` for external or manually active anchors.
- Keep `NavItem` variant-free; custom one-off treatment belongs in `class` or `style`.
- Use `NavLink match="exact"` when route matching should not select child routes.
- Keep generated drawers, rails, split pages, and app layouts in recipes until a stable cross-app need emerges.

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

## Visual Quality Standard

The default theme is optimized for quiet SaaS products: compact, readable,
low-noise, and resilient across mobile, tablet, desktop, light mode, and dark
mode. Theme work should improve that baseline without adding app-specific
behavior or marketing-page assumptions.

Use [../visual-check.html](../visual-check.html) as the manual audit surface
before shipping theme changes. Inspect `320`, `390`, `768`, `1024`, and desktop widths in both light and dark mode.

Acceptance criteria:

- No clipped text, accidental horizontal scroll, collapsed gaps, or misaligned icons.
- Controls share height, padding, radius, typography, and focus treatment.
- Long enterprise labels wrap or truncate intentionally in navs, cards, badges, tables, overlays, and dense rows.
- Overlays, menus, toasts, dialogs, and popovers fit narrow screens without fixed-width overflow.
- Typography feels deliberate: calm letter spacing, readable line heights, and balanced heading scale.
- Dark mode has equal depth, contrast, and polish rather than inverted colors only.
- Dense SaaS screens scan cleanly without feeling cramped.

Computed browser tests should cover stable contracts such as nonzero padding,
shared control heights, focus ring presence, mobile overlay width, wrapped
horizontal groups, and audit-page overflow. Screenshot baselines remain a
manual workflow for now.

## Template Sync

The source default theme and generated theme template must stay visually
aligned. When changing a file under `src/themes/default/styles`, update the
matching file under `templates/theme/styles` in the same change unless that
template file is intentionally different and covered by a test.

Keep selectors aligned with the public contract:

- Prefer low-specificity `:where(...)` rules.
- Target public `data-slot` hooks and documented alias classes only.
- Avoid deep internal selectors and `!important`.
- Add class aliases selectively and update selector contract tests when they
  become public authoring API.

## See Also

- [Tokens](./tokens.md)
- [askr-themes](./askr-themes.md)
