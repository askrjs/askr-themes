# Styling: Tokens

Design tokens are CSS custom properties that control the default Askr visual
language. They are global, prefixed with `--ak-*`, and intended to be overridden
by applications.

## Token Categories

| Category   | Examples                                                        |
| ---------- | --------------------------------------------------------------- |
| Color      | `--ak-color-primary`, `--ak-color-surface`, `--ak-color-text`   |
| Spacing    | `--ak-space-1`, `--ak-space-md`, `--ak-layout-page-gutter`      |
| Typography | `--ak-font-size-sm`, `--ak-type-7-size`, `--ak-font-weight-md`  |
| Radius     | `--ak-radius-sm`, `--ak-radius-md`, `--ak-radius-round`         |
| Density    | `--ak-density-control-height-md`, `--ak-density-control-padding-x-md` |
| Shadow     | `--ak-shadow-sm`, `--ak-shadow-lg`                              |

The default token set is tuned for admin and internal tools: neutral surfaces,
one primary accent, compact density, restrained radius values, and border-led
separation.

## Override Tokens

Place app overrides after the theme import:

```css
@import '@askrjs/themes/default';

:root {
  --ak-color-primary: #1d4ed8;
  --ak-radius-md: 6px;
  --ak-layout-page-gutter: clamp(1rem, 1.5vw, 1.75rem);
}
```

For theme variants, scope overrides to an attribute or class:

```css
[data-theme='compact'] {
  --ak-density-control-height-md: 2rem;
  --ak-space-md: 0.75rem;
}
```

## Token Policy

- Prefer semantic tokens over component-specific overrides.
- Keep app-defined token names in the same `--ak-*` namespace only when they are
  intended to participate in the theme contract.
- Do not hardcode token values in runtime TypeScript; keep visual decisions in CSS.

## See Also

- [askr-themes](./askr-themes.md)
- [Theming](./theming.md)
