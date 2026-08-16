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

## Askr North Star

Keep the path from explicit tokens and component composition to generated CSS
and package entrypoints narratable. Enforce token, slot, template, and export
invariants with errors that identify the affected family and correction. Test
missing, invalid, compatibility, generated-output, and real-browser composition
paths. Preserve the seams between tokens, default styles, component presets,
templates, and headless UI behavior. Prefer explicit theme composition over
automatic discovery, and add variants or escape hatches only for demonstrated
application needs.

## Validation

Run `npm run check` before opening a pull request.

## Optimization Gate

A benchmark number is only half of an optimization's success criterion. The
change must also preserve a causal path that a human or agent can narrate in one
sentence.

Every benchmark-driven change must include:

1. the one-sentence causal description of the optimized path;
2. the exact fallback trigger and proof that optimized and fallback paths have
   identical observable behavior and error surfaces;
3. an explicit legibility-cost statement, including `none` when no new path or
   concept is introduced; and
4. evidence that a measured bottleneck in a real application justifies the
   optimization now.

Prefer making the existing single path faster. New caches, inference,
memoization, shortcuts, fast paths, or scheduler states require an explicit
legibility decision; a speedup alone does not justify them.
