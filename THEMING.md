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
:root { --ak-color-primary: purple; --ak-radius-md: 12px; }
```

Style override:

```css
[data-slot="button"][data-variant="primary"] { background: black; }
```

Rules: style only public data-* hooks, never internal DOM, no deep selectors, no !important.
