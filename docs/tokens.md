# Styling: Tokens

Design tokens are named CSS custom properties that control the visual language of an
Askr application.

> Detailed token reference is a work in progress.

## Token categories

| Category   | Examples                                           |
| ---------- | -------------------------------------------------- |
| Color      | `--ak-color-primary`, `--ak-color-surface`, `--ak-color-text` |
| Spacing    | `--ak-space-1`, `--ak-space-md`, `--ak-layout-page-gutter`    |
| Typography | `--ak-font-size-sm`, `--ak-type-7-size`, `--ak-font-weight-medium` |
| Radius     | `--ak-radius-sm`, `--ak-radius-md`, `--ak-radius-round`       |
| Density    | `--ak-density-control-height-md`, `--ak-density-control-padding-x-md` |
| Shadow     | `--ak-shadow-sm`, `--ak-shadow-lg`                            |

## Override tokens per-application

In `src/styles/tokens.css`:

```css
:root {
  --ak-color-primary: #4f46e5;
  --ak-radius-md: 6px;
  --ak-layout-page-gutter: clamp(1rem, 2vw, 2.25rem);
}
```

Override any token without touching `askr-themes` code.

## See also

- [askr-themes](./askr-themes.md)
- [Theming](./theming.md)
