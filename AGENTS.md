# AGENTS.md

Operational guide for contributors to `@askrjs/themes`.

## Scope

This repository owns Askr design tokens, default CSS themes, component
presets, and theme helpers. Keep token names and generated package entrypoints
backward compatible.

## Ground rules

1. Prefer token and composition changes over component-specific overrides.
2. Keep CSS, TypeScript helpers, README/THEMING.md, and package exports aligned.
3. Add regression coverage for changed theme contracts or generated bundles.
4. Do not hardcode theme tokens in runtime packages.

## Validation

Run `npm run check` before opening a pull request.
