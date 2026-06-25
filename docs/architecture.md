# Architecture

`@askrjs/themes` sits in the visual layer of the askr stack. The three packages
work together like this:

- `@askrjs/askr` owns creation, rendering, routing, and runtime primitives.
- `@askrjs/ui` owns behavior, focus management, keyboard interaction, and ARIA.
- `@askrjs/themes` owns tokens, visual styling, layout composition, and theme-owned wrappers.

That boundary is intentional. It keeps behavior local to `@askrjs/ui` and keeps
the theme package easy to extend without forcing apps to fight prop soup.

## Why Button Comes From `@askrjs/ui`

`Button` is a behavior-rich control: it needs keyboard handling, disabled state,
and `asChild` composition support. Those responsibilities belong in `@askrjs/ui`,
so `@askrjs/themes` re-exports it and styles it. That is the package rule: when
the default theme styles a `@askrjs/ui` primitive, apps import that styled
primitive from the matching `@askrjs/themes/*` family.

## Why ButtonGroup, Close, Field, and InputGroup Live Here

Those wrappers are visual composition. They arrange or style existing controls,
but they do not own the interaction model. That makes them a good fit for the
theme package.

## Adding A New Control

When a surface needs behavior:

1. Add the primitive or control behavior in `@askrjs/ui`.
2. Add the visual treatment in `@askrjs/themes`.
3. Re-export from the theme entrypoint that matches the concern: `controls`,
   `surfaces`, `navs`, `overlays`, or `core`.

When a surface only needs layout or styling, keep it in `@askrjs/themes`.
