# Theming

Import a theme:

```css
@import "@askrjs/askr-themes/default";
```

Pick a mode on an ancestor:

```html
<html data-theme="light"></html>
<html data-theme="dark"></html>
```

Token override:

```css
:root {
  --ak-color-primary: purple;
  --ak-radius-md: 12px;
}
```

Style override:

```css
[data-slot="button"][data-variant="primary"] {
  background: black;
}
```

Rules: style only public data-\* hooks, never internal DOM, no deep selectors, no !important.

Responsive rules:

- Build mobile first. Base selectors must work on narrow screens; larger layouts are additive via `min-width` media queries.
- Official themes use semantic breakpoints `sm`, `md`, `lg`, and `xl` for `data-collapse-below`.
- Keep breakpoint values centralized in theme tokens so default and generated themes stay aligned.
- Responsive behavior must target only public hooks such as `data-collapse-below`, `data-columns`, `data-min-item-width`, `data-gap`, `data-sidebar-position`, and `data-sidebar-width`.
