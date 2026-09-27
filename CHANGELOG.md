# Changelog

## Unreleased

### Breaking

- The default palette moves from grayscale to an ink plum accent with warm
  neutral surfaces. Beyond the primary scale, the neutrals, hover, selected,
  focus-ring, and every `--ak-dark-color-*` token are plum-tinted, so rebrands
  that overrode only the light primary tokens should also override those.
- `Card` owns its inline inset. The root pads its inline sides with
  `--ak-card-inset` (a single length, default `var(--ak-space-2xl)`) instead of
  `padding: 2xl 0`, and `CardHeader`, `CardContent`, and `CardFooter` drop
  their own inline padding anywhere inside a card; outside a card they keep it.
  Direct children such as separators, tables, and images are now inset; add
  `data-bleed` to a direct child to run it edge to edge (`menu-content` placed
  directly in a card does so by default and drops its own frame;
  `data-bleed="false"` keeps either inset). Change the
  inset with the optional `--ak-card-inset` hook (default
  `var(--ak-space-2xl)`, resolved on each card), not `padding`.
- Attached `ButtonGroup`s without an explicit `orientation` now emit
  `data-responsive="true"` and stack at phone width (`max-width: 30rem`).
  Pass `orientation="horizontal"` to keep the row. Groups that contain icon
  buttons, and detached groups, keep their row. Raw markup opts in with both
  `data-attached="true"` and `data-responsive="true"`.
- Attached vertical `ButtonGroup` join rules (radii and the -1px overlap) now
  require `data-attached="true"`. The `.btn-group-vertical` class alias works on
  its own or with `.btn-group`.

### Changed

- Attached vertical `ButtonGroup`s round only their outer top and bottom
  corners at every width, and a lone button keeps all four corners.
- The focused button in an attached `ButtonGroup` lifts above its neighbors so
  the -1px overlap never covers its focus ring; hover does not lift.
- `--ak-card-inset` inherits like any token, so it also applies to nested
  cards unless they set their own.
- Card sections inside floating, navigation, menu, or toast surfaces within a
  card keep their own inline padding.
- Hover stays visible on muted tracks such as pills and toggle groups, tested
  as a contrast pair.
- Raw radio items and select triggers with the native `disabled` attribute
  block pointer input like their `data-disabled` forms.
- `ButtonGroup` keeps a caller-supplied `data-responsive`.
- Raw `[data-slot="empty-state"]` and `.empty-state` markup on plain block containers (`div`,
  `section`, `article`, `aside`, `figure`) that are not `hidden` or popovers
  gets a centered grid rhythm; the `EmptyState` component keeps its `Block`
  props (`hide`, `padding`, `gap`).
- Native `button`, `input`, `select`, and `textarea` elements with a
  `data-slot` use the surrounding font family instead of the browser's control
  font.
- The shared disabled style also matches the native `disabled` attribute on
  raw button, input, textarea, select-trigger, checkbox, radio, and switch
  markup (raw disabled buttons also stop reacting to the pointer, like the
  `.btn` alias), and changes only `background-color` so the checkbox mark keeps
  its image. Disabled checked and mixed checkboxes and disabled switch thumbs,
  including natively disabled ones, draw in `--ak-color-text-muted`, which stays
  readable on the disabled fill in the default theme and every preset.
- Disabled textareas use the disabled tokens instead of half opacity.
  Natively disabled textareas (including the `Textarea` component) stay
  scrollable and selectable but cannot be resized; `data-disabled` without the
  native attribute blocks pointer input.
- Hover fills stay perceptible on popover surfaces in light and dark mode, and
  selected and primary-soft fills stay clearly stronger than hover.
  `--ak-color-selected` now references `--ak-color-primary-soft` (and the dark
  token its dark counterpart), so rebrands carry through to selection fills.
- Synced `templates/theme` with the default theme; template parity now covers
  every shared file.

## 0.3.0 - 2026-09-11

### Removed

- **Breaking:** removed the legacy layout aliases `Box`, `Inline`, `Shell`,
  `ShellNav`, and `ShellMain`, along with the `LegacyLayoutProps` type. Use
  `Block` with an explicit `direction`.
- **Breaking:** removed the legacy layout prop conveniences from the intent
  layouts: the `gap`, `p`, `padding`, and `wrap` shorthands, the
  `"none" | "1" … "8"` legacy space scale, and the `"wrap" | "nowrap"` string
  forms. Use the `Block` spacing props and the named space scale.

### Changed

- `Stack`, `Cluster`, and `Center` remain supported intent layouts; only their
  legacy props were removed.
- Moved the `@askrjs/askr` and `@askrjs/ui` peer ranges to `>=0.3.0 <0.4.0`.

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
