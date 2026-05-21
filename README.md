# @askrjs/themes

CSS tokens, shell chrome, and styled composition helpers for Askr apps.

`@askrjs/themes` is the visual companion to `@askrjs/ui` and
`@askrjs/charts`. It owns the default theme, shared layout wrappers, and
theme-aware component styling while behavior and data contracts stay in the
other packages.

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

Then set `data-theme` to `tabby`, `ginger`, `tuxedo`, `calico`, or `torty`.
For picker/toggle composition, import `CAT_THEME_OPTIONS` and `CAT_THEME_NAMES`
from `@askrjs/themes/theme`.

Then use the theme helpers and curated component surfaces:

```tsx
import { ThemeProvider, ThemeToggle } from "@askrjs/themes/theme";
import { Button, ButtonGroup, Field, InputGroup } from "@askrjs/themes/controls";

export function AppShell() {
  return (
    <ThemeProvider>
      <ButtonGroup>
        <Button variant="primary">Save</Button>
        <ThemeToggle>{({ nextTheme }) => nextTheme}</ThemeToggle>
      </ButtonGroup>

      <Field>
        <InputGroup>
          <input />
        </InputGroup>
      </Field>
    </ThemeProvider>
  );
}
```

## What To Import

- `@askrjs/themes/theme` for `ThemeProvider`, `ThemePicker`, `ThemeToggle`,
  and `useTheme`
- `@askrjs/themes/controls` for theme-styled controls such as `Button`,
  `ButtonGroup`, `Close`, `Field`, and `InputGroup`
- `@askrjs/themes/layouts`, `@askrjs/themes/shells`, `@askrjs/themes/navs`,
  `@askrjs/themes/surfaces`, `@askrjs/themes/feedback`, and
  `@askrjs/themes/overlays` for the curated visual composition surfaces

## Theme Contract

- Style public `data-*` hooks and token variables, not internal DOM structure.
- Prefer token overrides before component overrides.
- Keep selectors low specificity so downstream apps can customize them cleanly.
- Use [THEMING.md](./THEMING.md) and [docs/architecture.md](./docs/architecture.md)
  for the full contract and package boundaries.

- Use `visual-check.html` for manual QA across light and dark modes.
