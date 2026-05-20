# Styling: Tokens

Design tokens are CSS custom properties that control the default Askr visual
language. They are global, prefixed with `--ak-*`, and intended to be overridden
by applications.

## Semantic Registry

Tokens are role-based first. Components should consume a semantic role such as
`--ak-color-surface-overlay`, `--ak-density-control-height-md`, or
`--ak-z-dropdown` before asking for a component-specific token. Add a
component-specific token only when the same semantic token cannot express a
repeated, real design-system need.

| Role       | Contract                                                                    |
| ---------- | --------------------------------------------------------------------------- |
| Color      | Brand, text, surface, border, status, disabled, selected, hover, and active |
| Typography | Font families, sizes, weights, and line heights                             |
| Spacing    | Semantic spacing scale and numeric compatibility aliases                    |
| Density    | Control heights and horizontal padding                                      |
| Layout     | Navbar, sidebar, container, section, gutter, and panel sizing               |
| Elevation  | Shadow levels for raised surfaces and overlays                              |
| Focus      | Focus ring color, width, and offset                                         |
| Motion     | Durations and easing curves                                                 |
| Z-index    | Dropdown, popover, tooltip, sticky, fixed, backdrop, and modal layers       |
| State      | Hover, active, selected, disabled, and backdrop state roles                 |

## Token Categories

| Category   | Examples                                                              |
| ---------- | --------------------------------------------------------------------- |
| Color      | `--ak-color-primary`, `--ak-color-surface`, `--ak-color-text`         |
| Typography | `--ak-font-size-sm`, `--ak-font-size-md`, `--ak-font-weight-medium`   |
| Spacing    | `--ak-space-1`, `--ak-space-md`, `--ak-layout-page-gutter`            |
| Density    | `--ak-density-control-height-md`, `--ak-density-control-padding-x-md` |
| Layout     | `--ak-layout-navbar-height`, `--ak-layout-sidebar-width`              |
| Elevation  | `--ak-shadow-sm`, `--ak-shadow-lg`                                    |
| Focus      | `--ak-focus-ring-width`, `--ak-color-focus-ring`                      |
| Motion     | `--ak-duration-fast`, `--ak-duration-normal`, `--ak-ease-standard`    |
| Z-index    | `--ak-z-dropdown`, `--ak-z-modal`, `--ak-z-tooltip`                   |
| State      | `--ak-color-hover`, `--ak-color-selected`, `--ak-color-disabled-text` |
| Radius     | `--ak-radius-sm`, `--ak-radius-md`, `--ak-radius-round`               |

The default token set is tuned for admin and internal tools: neutral surfaces,
one primary accent, compact density, restrained radius values, and border-led
separation.

## Override Tokens

Place app overrides after the theme import:

```css
@import "@askrjs/themes/default";

:root {
  --ak-color-primary: #1d4ed8;
  --ak-radius-md: 6px;
  --ak-layout-page-gutter: clamp(1rem, 1.5vw, 1.75rem);
}
```

For theme variants, scope overrides to an attribute or class:

```css
[data-theme="compact"] {
  --ak-density-control-height-md: 2rem;
  --ak-space-md: 0.75rem;
}
```

## Token Policy

- Prefer semantic tokens over component-specific overrides.
- Keep component-specific tokens out of public contracts unless a semantic token
  would collapse two distinct repeated roles into one ambiguous value.
- Keep app-defined token names in the same `--ak-*` namespace only when they are
  intended to participate in the theme contract.
- Do not hardcode token values in runtime TypeScript; keep visual decisions in CSS.
- Component CSS should reference `--ak-*` tokens for color, elevation, focus,
  motion, z-index, and reusable layout decisions instead of raw visual values.

## See Also

- [askr-themes](./askr-themes.md)
- [Theming](./theming.md)
