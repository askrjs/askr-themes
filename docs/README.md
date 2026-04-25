# @askrjs/askr-themes

Default theme tokens, styles, and themed layout wrappers for askr-ui.

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

For visual-only layout wrappers backed by `askr-ui` primitives:

```ts
import { SidebarLayout } from "@askrjs/askr-themes/default/sidebar-layout";
import { TopbarLayout } from "@askrjs/askr-themes/default/topbar-layout";
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
} from "@askrjs/askr-themes/default/card";
```
