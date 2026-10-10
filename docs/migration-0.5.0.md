# Migrating to Themes 0.5.0

The complete [public API decision table](./0.5.0-public-api.md) records all
1,186 existing name/path pairs and the 199 supported package paths. The
aggregate `@askrjs/themes/components` entry remains available for applications
that compose several component families. Individual family entries remain
available for granular imports. The package root remains CSS.

## Dialog and Sheet

The eight `Drawer` names were exact Dialog aliases. Replace them as follows,
using `@askrjs/themes/dialog` or the aggregate components entry:

| Removed name        | Replacement         |
| ------------------- | ------------------- |
| `Drawer`            | `Dialog`            |
| `DrawerTrigger`     | `DialogTrigger`     |
| `DrawerPortal`      | `DialogPortal`      |
| `DrawerOverlay`     | `DialogOverlay`     |
| `DrawerContent`     | `DialogContent`     |
| `DrawerClose`       | `DialogClose`       |
| `DrawerTitle`       | `DialogTitle`       |
| `DrawerDescription` | `DialogDescription` |

The `@askrjs/themes/drawer` path is removed. For a panel positioned at an edge,
use `Sheet` and `SheetContent` from `@askrjs/themes/sheet`. `SheetContent` accepts
`side="top"`, `"right"`, `"bottom"` or `"left"`, and defaults to `"right"`.
Sheet content, title, description, header and footer keep their distinct style
slots; their styling differs from plain Dialog composition.

## Toaster and Toast

Replace `Sonner` with `Toaster` and move imports from
`@askrjs/themes/sonner` to `@askrjs/themes/toaster`. The existing aggregate
`Toaster` import remains supported. `Toaster` keeps the same presentational
implementation and `data-slot="sonner"` style hook. It supplies no imperative
notification function, queue, timer, stacking or dismissal behavior.

Use the separate `ToastHost`, `ToastViewport` and `Toast` composition from
`@askrjs/themes/toast` when the application needs notification behavior.

## Props, accessibility and JSX

Component props and types that describe retained public signatures remain
supported. Accessibility metadata constants and aliases of their `typeof`
types are removed from family and aggregate re-exports. Use the documented
props and observable DOM roles, labels, keyboard interaction and focus behavior
when composing or testing a control. The decision table lists each removed
name and its owning path.

Themes no longer declares global `JSX.Element`. Import the scoped type wherever
the application writes explicit JSX type annotations:

```ts
import type { JSX } from "@askrjs/askr/jsx-runtime";

export type Content = JSX.Element;
```

Keep the Askr JSX compiler configuration for TSX applications.

## SSR and SSG

Keep using `withThemeStyles` from `@askrjs/themes/ssr`. Its renderer-specific
argument and return relationship is preserved, including custom renderer
fields. The bundled private name `DocumentRenderArgsLike` is removed. Use the
public document argument type from the renderer that calls your document
function, or describe your custom function's own arguments directly.

Generated classes still require the current request's style registrations.
Registering the same ID and CSS more than once emits one rule in its original
order; conflicting CSS under one ID throws. Each document call keeps its own
registrations and CSP nonce.

## CSS, templates and custom themes

Existing supported CSS and template files keep their target paths, contents and
relative imports. The package now enumerates those paths explicitly. Matching
an old wildcard no longer makes an unknown or internal file public. Use a path
listed in the decision table; deep `src` and `dist` imports remain private.

Token names, custom CSS themes, the theme generator and custom `ThemeName`
strings remain supported. Supply the corresponding CSS for your custom name.
ThemeScope continues to coordinate the document or shadow host; explicit
`data-theme` wrappers provide separate CSS islands.

All Askr sibling versions and peer ranges are coordinated during final 0.5.0
candidate preparation. This guide does not indicate that the release has been
published.
