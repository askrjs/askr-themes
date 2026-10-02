# Changelog

## Unreleased

### Changed

- Render checkboxes and switches at 1.5x on coarse pointers and viewports up to
  `30rem`, so their targets reach the 24px WCAG 2.5.8 minimum. Link-style
  buttons keep a 24px minimum height there, and an icon-only navbar brand keeps
  a full-size target.
- Keep breadcrumb trails on one line. Ancestors truncate with an ellipsis and
  the current page stays whole, up to three quarters of the trail.
- Keep the focus ring on the zoomed checkbox and switch at the shared 3px width
  and 2px gap, instead of the 4px ring and 3px gap that zoom produced.
- Keep attached button groups, tabs, pills, and the `Tabs` list on one row with
  whole labels. When the container is too narrow they scroll horizontally inside
  their own box instead of wrapping onto extra rows or breaking a word. The
  phone-width stacked column keeps wrapping labels inside its full-width buttons.
  The focus ring on a tab, pill, or tab trigger is drawn inside the item so the
  scrolling row cannot clip it.

### Fixed

- Stop a wrapped breadcrumb stranding a separator at the end of a line.
- Keep the spacing between an icon and its label in a breadcrumb link or page,
  which the truncation layout had dropped, and cap only the item that holds the
  current page rather than whichever item is last.

### Documentation

- Document that tabs, pills, and attached button groups scroll inside their own
  box when too narrow, that attached groups stack on phones by default, the
  breadcrumb truncation behaviour, the `zoom` requirement for touch-sized
  controls, and the `data-nav-brand-label` hook for the navbar brand.

### Tests

- Add `audit-heuristics.spec.ts`, which measures the whole audit page at 320,
  375, 768, and 1440px for mid-word breaks, undersized hit areas, dangling
  breadcrumb separators, a truncated current page, text under 12px, and content
  overflowing the viewport outside a scroll container. The same heuristics run
  against the real components in `real-component-heuristics.spec.ts`, so a
  green audit page cannot hide a gap between its hand-written markup and what
  the components render.

### Audit page

- Give the command palette sample a search input, the input group sample a
  labelled addon and placeholder, and the selection controls sample consistent
  labelled rows. Replace the placeholder `Aa` theme button with an icon, mark
  the navbar brand label with `data-nav-brand-label` so it truncates and shares
  a row with the menu toggle, match the real `ButtonGroup`'s default
  `data-responsive`, and tighten the aspect-ratio frame.

## 0.4.2 - 2026-10-01

### Fixed

- Preserve the published global `JSX.Element` compatibility declaration when
  importing theme components, alongside scoped JSX types.
- Preserve the published specificity of explicit dark and preset theme token
  blocks, so existing theme overrides keep working on the document root.
- Raise subtle metadata contrast to 4.5:1 on the page and main surface in
  calico, ginger, and tabby, preserving the token names and relative emphasis.
- Publish generated component styles with committed DOM attachments so
  pending large subtrees keep their rules, rejected renders leave no new
  rules, and server rendering does not modify an ambient browser document.
- The cat presets' focus rings are now solid colours that reach 3:1 against
  every surface, primary-soft, and selected fill in their theme (#164). They
  were 22–24% translucent fills left over from the old halo, which composite
  to about 1.3–2.0:1 as the gapped outline. The new values are calico
  `#3a6cc0`, ginger `#c2560f`, tabby `#a0683a`, torty `#e0a854`, and tuxedo
  `#cbd5e1`. The unit and browser contrast suites now check preset rings the
  same way they check the default theme.

### Changed

- The default palette moves from plum to a bright blue: `--ak-color-primary`
  is now `#2d5dd6` (dark `#9db8ff`), with `--ak-color-primary-soft` `#d4e0fa`
  (dark `#283b66`), `--ak-color-primary-ink` `#1f47a8` (dark `#c9d8ff`), dark
  `--ak-color-text-inverse` `#0f1b38`, and `--ak-color-focus-ring`
  `oklch(0.56 0.16 263)` (dark `oklch(0.72 0.13 262)`). The plum-tinted
  neutrals (text, surfaces, borders, hover, and disabled tokens) shift to a cool
  slate in both modes. Primary text, links, inverse text on the primary, and
  primary ink on primary soft all keep 4.5:1. Token names are unchanged. Apps
  that override only the primary scale now get slate neutrals instead of plum
  ones. The cat preset accents stay unchanged; their focus and metadata
  contrast repairs are listed below.
- Focus rings are drawn once, as an `outline` of `--ak-focus-ring-width` in
  `--ak-color-focus-ring` set `--ak-focus-ring-offset` (2px) away from the
  control for outset rings, from a single `:where(:focus-visible)` rule in
  `styles/base/reset.css`. Because the rule has zero specificity, it also
  replaces the browser's default ring on plain links, native controls, and
  `tabindex` elements, and any app `outline` rule overrides it. Components no
  longer draw their own zero-offset `box-shadow` ring. Outset rings need 3:1
  against the surrounding surface; inset rings also need contrast against the
  control or row fill. Rows inside clipping containers (menu, dropdown,
  menubar, select, and command items, sidebar rows, the navbar toggle) draw
  the ring inset, and focused members of attached button and input groups are
  lifted above their neighbours. Attached filled buttons use their contrasting
  text color for the inset ring. Focused buttons no longer switch their border
  to `--ak-color-ring`. Apps that styled focus by overriding a component's
  focus `box-shadow` should override `outline`/`outline-offset` or the
  `--ak-focus-ring-*` tokens instead.

### Internal

- Local Playwright runs start the browser harness on a free port instead of a
  fixed 4318, so parallel runs in different worktrees no longer reuse each
  other's harness and test the wrong checkout. Reusing a running harness is
  opt-in with `PW_REUSE_SERVER=1`, and a reused harness that serves another
  checkout is refused before any test runs. `ASKR_TEST_PORT` pins the port.
  CI still uses port 4318 and never reuses a server.

- Pin the existing Playwright 1.63.0 lockfile resolution in the development
  dependency declaration so the declared browser runner matches the qualified
  lockfile. Browser test timeouts and local retry settings are unchanged.

## 0.4.1 - 2026-09-30

### Fixed

- Reclaim generated style rules when components stop using them so dynamic
  inline style values do not exhaust the stylesheet rule limit during an SPA
  session.

### Breaking

- The default palette moves from grayscale to an ink plum accent with warm
  neutral surfaces. Beyond the primary scale, the neutrals, hover, selected,
  focus-ring, and every `--ak-dark-color-*` token are plum-tinted, so rebrands
  that overrode only the light primary tokens should also override those.
- `Card` owns its inline inset. The root pads its inline sides with
  `--ak-card-inset` (a single length, default `var(--ak-space-2xl)`) instead of
  `padding: 2xl 0`, and `CardHeader`, `CardContent`, and `CardFooter` drop
  their own inline padding inside a card (outside a card, or inside a floating
  surface within one, they keep it).
  Direct children such as separators, tables, and images are now inset; add
  `data-bleed` to a direct child to run it edge to edge (`menu-content` placed
  directly in a card does so by default and drops its own frame;
  `data-bleed="false"` keeps either inset). Change the inset with the optional
  `--ak-card-inset` hook (default `var(--ak-space-2xl)`, resolved on each
  card); overriding the card's `padding` instead also removes section padding,
  because sections rely on the card's inset.
- Attached `ButtonGroup`s without an explicit `orientation` now emit
  `data-responsive="true"` and stack at phone width (`max-width: 30rem`).
  Pass `orientation="horizontal"` to keep the row. Groups that contain icon
  buttons, and detached groups, keep their row. Raw markup opts in with both
  `data-attached="true"` and `data-responsive="true"`.
- Attached vertical `ButtonGroup` join rules (radii and the -1px overlap) now
  require `data-attached="true"`. The `.btn-group-vertical` class alias works on
  its own or with `.btn-group`.

### Changed

- Palette states use one vocabulary (audited with TypeSafe Jev against the
  THEMING.md token meanings): neutral hover and keyboard highlight use
  `--ak-color-hover` everywhere (theme styles no longer use its
  `--ak-color-accent` alias, which stays defined); checked select options,
  active items, selected table rows, active sidebar buttons, and checked radio
  cards use `--ak-color-selected`, so selection no longer looks like hover.
  Tabs, pagination, breadcrumbs, the navbar toggle, secondary buttons, table
  rows, and radio cards hover with `--ak-color-hover` instead of muted-surface
  mixes; selected tabs lift onto `--ak-color-surface` like toggle groups; the
  slider thumb no longer changes fill on hover; and the switch hover mixes
  toward the text color, shifting toward the foreground in either mode.

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
- Raw inputs, radio items, and select triggers with the native `disabled`
  attribute block pointer input like their `data-disabled` forms.
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
  token its dark counterpart), so rebrands at the theme scope (`:root` or a
  `[data-theme]` block) carry through to selection fills.
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
