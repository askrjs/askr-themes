# Changelog

## Unreleased

## 0.2.5 - 2026-08-28

- Restore vertical flow inside `EmptyState` content.
- Keep `Stack` as a supported intent-level layout while preserving its former
  spacing, padding, and wrapping conveniences.
- Require installed package entries for the supported `Stack`, `Cluster`, and
  `Center` layouts and execute TypeScript JSX unit tests in the standard gate.

## 0.2.4 - 2026-08-25

- Restore `PageHeader` title and description stacking after the `Block` native-initial fix in #94/#96, and add computed-style regression coverage.
- Add `MetaStrip` for semantic compact key/value facts in inline and stacked layouts.
- Add `CopyButton` with Clipboard API failure handling, timed visual feedback, and live-region announcements.
- Theme standalone UI menus with default borders, item dividers, link states, icons, labels, and descriptions.

## 0.2.3 - 2026-08-23

- Corrected `Block` layout fallbacks so omitted properties now resolve to
  their native CSS initial values. Existing consumers that unintentionally
  relied on `Block` forcing column direction, stretched alignment, zero gap,
  or a zero minimum width should pass the corresponding Block prop explicitly.
- Stopped the generic `data-slot="block"` hook from inheriting the structural
  components' defensive `min-inline-size: 0` rule; dedicated structural slots
  retain that constraint.
- Clarified that the shipped Dialog and AlertDialog overlays already provide
  the default backdrop, blur, stacking, and animation treatment, and documented
  token-level customization instead of competing overlay classes.
- Preserve the divider on every nonterminal virtual-table row by consuming the
  UI component's explicit terminal-row marker, with synchronized generated
  theme styles and forced-colors coverage.
- Keep the default navbar groups and page body direction explicit where their
  intended column layout differs from `Block`'s native row default.
- Refresh the transitive Nano ID lockfile resolution to address the current
  audit advisory.
- Refresh eligible AskrJS and development-tool dependency ranges with
  `askr update`, including the required UI `0.2.2` terminal-row contract.
