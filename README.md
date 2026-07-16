# @askrjs/themes

CSS tokens and a shadcn-style styled component catalog for Askr apps.

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

## What To Import

- `@askrjs/themes/components` for the styled component catalog.
- `@askrjs/themes/<component>` for package subpaths such as
  `@askrjs/themes/button`, `@askrjs/themes/card`, and
  `@askrjs/themes/dialog`.
- `@askrjs/themes/theme` for `ThemeScope`, `ThemePicker`, `ThemeToggle`,
  and `theme`.
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
