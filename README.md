# @askrjs/themes

[![CI](https://github.com/askrjs/askr-themes/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/askrjs/askr-themes/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40askrjs%2Fthemes.svg)](https://www.npmjs.com/package/@askrjs/themes)

CSS tokens and a styled component catalog for Askr apps.

`@askrjs/themes` is the visual companion to `@askrjs/ui` and
`@askrjs/charts`. It owns the default theme and styled component catalog while
behavior stays in `@askrjs/ui` and chart components stay in `@askrjs/charts`.

## Install

```bash
npm install @askrjs/themes @askrjs/ui
```

## Quick Start

Import the default theme CSS in your app stylesheet:

```css
@import "@askrjs/themes/default";
```

Add the optional cat preset layer after the default theme when you want the
curated preset family:

```css
@import "@askrjs/themes/default";
@import "@askrjs/themes/presets";
```

For a small page that only uses individual controls, import their JavaScript
and CSS independently instead of the full default theme:

```tsx
import { Input } from "@askrjs/themes/input";
import { Label } from "@askrjs/themes/label";
import "@askrjs/themes/default/foundations.css";
import "@askrjs/themes/default/input.css";
import "@askrjs/themes/default/label.css";
```

The foundations entry contains tokens and base/reset styles. Component CSS
entries contain only that component's styles. `@askrjs/themes/default` remains
the batteries-included theme.

See [Acknowledgements](./docs/acknowledgements.md) for the open-source projects
that inspired parts of the design philosophy.

For documentation search and command launchers, use the accessible
`CommandPalette` composition from `@askrjs/themes/command`; it owns themed
presentation while `@askrjs/ui` supplies dialog focus and dismissal behavior.

Then set `data-theme` to `tabby`, `ginger`, `tuxedo`, `calico`, or `torty`.
For picker/toggle composition, import `CAT_THEME_OPTIONS` and `CAT_THEME_NAMES`
from `@askrjs/themes/theme`.

Then use the theme helpers and component catalog:

```tsx
import { ThemeScope, ThemeToggle } from "@askrjs/themes/theme";
import { Button, ButtonGroup, Field, Input, InputGroup, Label } from "@askrjs/themes/components";

export function AppShell() {
  return (
    <ThemeScope>
      <ButtonGroup>
        <Button variant="primary">Save</Button>
        <ThemeToggle>{({ nextTheme }) => nextTheme}</ThemeToggle>
      </ButtonGroup>

      <Field>
        <Label for="workspace">Workspace</Label>
        <InputGroup>
          <Input id="workspace" name="workspace" />
        </InputGroup>
      </Field>
    </ThemeScope>
  );
}
```

### SSR and SSG

Layout props on `Block`, `Container`, `Grid`, `AspectRatio`, and `Skeleton`
produce CSP-compatible generated rules. Wrap the Askr document renderer so
those rules are serialized into the initial document and adopted during
hydration:

```ts
import type { DocumentRenderArgs } from "@askrjs/askr/ssg";
import { withThemeStyles } from "@askrjs/themes/ssr";

function renderDocument({ appHtml }: DocumentRenderArgs) {
  return `<!doctype html><html><head></head><body><div id="app">${appHtml}</div></body></html>`;
}

export const staticConfig = {
  // ...
  document: withThemeStyles(renderDocument),
};
```

The wrapper also applies `context.cspNonce` to the emitted style registry and
requires the request-local style registrations provided by Askr 0.0.85 or
newer. It fails clearly if generated classes and their registered rules ever
diverge instead of emitting unstyled markup. Use the same wrapper for an SSR
`document` callback.

## What To Import

- `@askrjs/themes/components` for the styled component catalog.
- `@askrjs/themes/<component>` for package subpaths such as
  `@askrjs/themes/button`, `@askrjs/themes/card`, and
  `@askrjs/themes/dialog`.
- `@askrjs/themes/theme` for `ThemeScope`, `ThemePicker`, `ThemeToggle`,
  and `theme`.
- `@askrjs/themes/ssr` for the SSR/SSG generated-style document wrapper.
- `@askrjs/charts` for charts; chart components are intentionally not exported
  from `@askrjs/themes`.

## Theme Contract

- Style public `data-*` hooks and token variables, not internal DOM structure.
- Prefer token overrides before component overrides.
- Keep selectors low specificity so downstream apps can customize them cleanly.
- Use [THEMING.md](./THEMING.md) and [docs/architecture.md](./docs/architecture.md)
  for the full contract and package boundaries.
- Use [docs/component-anatomy.md](./docs/component-anatomy.md) for stable slot
  hooks and [docs/customization.md](./docs/customization.md) for the KISS
  customization path.
- Use [docs/recipes.md](./docs/recipes.md) for copyable login, admin shell,
  settings form, table, dropdown, and detail-page patterns.

- Use `visual-check.html` for manual QA across light and dark modes.
