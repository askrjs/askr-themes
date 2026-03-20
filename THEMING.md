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

Icon override:

```css
[data-slot="icon"][data-size="sm"] {
  --ak-icon-size-sm: 0.875rem;
  --ak-icon-stroke-width-sm: 1.5;
}
```

Rules: style only public data-\* hooks, never internal DOM, no deep selectors, no !important.

Responsive rules:

- Build mobile first. Base selectors must work on narrow screens; larger layouts are additive via `min-width` media queries.
- Official themes use semantic breakpoints `sm`, `md`, `lg`, and `xl` for `data-collapse-below`.
- Keep breakpoint values centralized in theme tokens so default and generated themes stay aligned.
- Responsive behavior must target only public hooks such as `data-collapse-below`, `data-columns`, `data-min-item-width`, `data-gap`, `data-sidebar-position`, and `data-sidebar-width`.
- Prefer token overrides first. Reach for component CSS overrides only when tokens are insufficient.
- Keep selectors low-specificity so a custom theme can override a rule with one equally specific selector. `:where(...)` is preferred for official theme baselines.
- Broad layout slots like `main`, `sidebar`, and `navbar` must always be anchored to a public layout root such as `topbar-layout` or `sidebar-layout`.
- Named layout hooks such as `data-size`, `data-max-width`, `data-padding`, `data-gap`, and `data-sidebar-width` are part of the public theme contract and should resolve through theme tokens rather than hard-coded values.
- Icons are part of the public theme contract. `@askrjs/askr-ui` owns the canonical icon hooks, and official icon wrappers should implement that contract by emitting `data-slot="icon"`, `data-icon`, semantic `data-size`, and `data-decorative` so themes can style them uniformly across icon sets.
- Icon size and stroke defaults should resolve through the shared icon tokens: `--ak-icon-size-sm|md|lg|xl` and `--ak-icon-stroke-width-sm|md|lg|xl`.
