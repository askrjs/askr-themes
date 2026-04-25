# @askrjs/askr-themes

Default theme tokens, styles, and visual components for askr-ui.

## Contents

- [Overview](./askr-themes.md) — What askr-themes is and when to use it
- [Tokens](./tokens.md) — Design token reference and overrides
- [Theming](./theming.md) — Layered CSS architecture and dark mode

## Quick start

```bash
npm install @askrjs/askr-themes
```

```ts
import "@askrjs/askr-themes/default";
```

For visual-only composition and display components:

```ts
import {
  Badge,
  Cluster,
  Skeleton,
  Stack,
} from "@askrjs/askr-themes/components";
```

For visual-only layout wrappers:

```ts
import {
  SidebarLayout,
  TopbarLayout,
} from "@askrjs/askr-themes/components";
```

For theme-owned visual components:

```ts
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@askrjs/askr-themes/components";
```

For app theme controls:

```tsx
import {
  ThemePicker,
  ThemeProvider,
  ThemeToggle,
} from "@askrjs/askr-themes/components";

export function App() {
  return (
    <ThemeProvider>
      <ThemePicker />
      <ThemeToggle lightIcon={<SunIcon />} darkIcon={<MoonIcon />} />
    </ThemeProvider>
  );
}
```
