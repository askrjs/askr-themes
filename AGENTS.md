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

`npm run test:browser` runs the Playwright suite against a Vite harness
(`vite.harness.config.ts`). Locally each run starts its own harness on a free
port, so runs in parallel worktrees stay isolated. `ASKR_TEST_PORT=<port>` pins
the port. To reuse a harness you already started from this checkout
(`npx vp dev --config vite.harness.config.ts`, port 4318), set
`PW_REUSE_SERVER=1`; the run fails fast if the server on that port serves a
different checkout. CI always starts a fresh harness on port 4318.

## Changelog

Any change to the `version` field in `package.json`, whether a release,
prerelease, or patch bump, must include a matching `## <version>` section in
`CHANGELOG.md` in the same commit or pull request. Date the section and list
breaking changes (with migration notes), deprecations, additions, and fixes.
Move entries from `Unreleased` into the new version section rather than leaving
them there. Do not publish or tag a version whose changelog section is missing.
Check with `npm run changelog:check` (the first step of `npm run check`, which
`prepublishOnly` and the publish workflow run), which fails when `CHANGELOG.md`
has no non-empty section for the current version.

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

## Jev review

Jev is TypeSafe's System One model: it returns typed choices, probabilities,
and scores for focused questions through `POST https://api.typesafe.ai/v1/systemone`
with model `jev-latest`. Use the `typesafe-ai` skill and current API documentation.
Read credentials from the configured environment or local credential file silently;
never print, commit, or preserve a key in request artifacts.

Use Jev to prioritize contract gaps and predict observable event sequences. Supply
the exact source, published contract, and relevant ordering. Define an
`insufficient_source` choice when appropriate. For a blind prediction, withhold
our diagnosis, patch explanation, and test results. Separate specificity, teardown,
render adoption, and SSR registration questions. Code computes contrast ratios and
compares declarations; Jev can prioritize semantic intent gaps.

Preserve requests, responses, and contradictory test outcomes outside the source
tree. A concentrated choice distribution is not proof of correctness. Reproduce
findings with regression tests and independent review, and measure useful verified
findings rather than call volume. Do not ask Jev to approve a patch or release.
