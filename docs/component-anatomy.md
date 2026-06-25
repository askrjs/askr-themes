# Component Anatomy

This document is the public styling contract for themed components. Stable
`data-slot` values are safe app styling hooks unless a section explicitly calls
them internal. Prefer tokens first, then documented slots. Use `class` or
`style` for rare one-off CSS. Do not add broad layout props to visual
components just to avoid CSS.

`Block` remains the only layout engine. Components such as `Container`,
`Header`, `Navbar`, `Card`, and `Field` either delegate layout to `Block` or
own a focused visual job.

## How To Read Anatomy

- **Shape** describes the rendered structure at a high level.
- **Slots** are stable `data-slot` hooks.
- **Aliases** are supported raw HTML classes where the theme intentionally
  provides them.
- **Style here** names durable app override points.
- **Avoid** names selectors or usage patterns that make UI harder to maintain.

## Block And Structure

`Block` renders one element, defaults to `div`, and always emits
`data-ak-layout="true"`. If no slot is provided, it emits `data-slot="block"`.
Semantic wrappers use their own slots.

| Component    | Shape                                                                       | Stable slots                                                                                                                    | Style here                                                                         | Avoid                                                                   |
| ------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `Block`      | One semantic element selected by `as` or `asChild`.                         | `block` by default, or the explicit `data-slot` you pass.                                                                       | Use layout props for spacing, sizing, flex, responsive values, and common visuals. | Do not create `Box`, `Stack`, `Flex`, or wrapper aliases.               |
| `Container`  | A `Block` that constrains width, centers content, and applies page gutters. | `container`                                                                                                                     | Use `size`, `paddingX`, and token overrides.                                       | Do not use it as a generic flex row.                                    |
| `Header`     | Semantic header with surface background and optional sticky behavior.       | `header`                                                                                                                        | Use for app or page chrome.                                                        | Do not build a second header shell component.                           |
| `Main`       | Semantic main region that can grow in app frames.                           | `main`                                                                                                                          | Use for the primary document region.                                               | Do not use it for card bodies or panels.                                |
| `Section`    | Semantic section with vertical rhythm.                                      | `section`                                                                                                                       | Use for page sections.                                                             | Do not nest section wrappers to create spacing. Use `Block gap`.        |
| `Aside`      | Semantic aside.                                                             | `aside`                                                                                                                         | Use for complementary content.                                                     | Do not use as a sidebar shell when `Sidebar` fits.                      |
| `Sidebar`    | Fixed-width side region with surface, border, and spacing defaults.         | `sidebar`                                                                                                                       | Use for app navigation rails.                                                      | Do not make product-specific shell behavior part of `Sidebar`.          |
| `Page`       | `main` plus centered page content.                                          | `page`, `container`, inner `block`                                                                                              | Use for ordinary product pages.                                                    | Do not use for split-screen auth or custom app shells.                  |
| `PageHeader` | Responsive title, description, and actions.                                 | `page-header`, `page-header-copy`, `page-header-title`, `page-header-description`, `page-header-actions`                        | Use for page-level copy and action groups.                                         | Do not put filters, tabs, or tables inside the header copy slot.        |
| `Toolbar`    | Compact title and actions row.                                              | `toolbar`, `toolbar-title`, `toolbar-actions`                                                                                   | Use for section/tool action bars.                                                  | Do not use as a full page header when `PageHeader` communicates better. |
| `EmptyState` | Centered message with optional icon and actions.                            | `empty-state`, `empty-state-content`, `empty-state-icon`, `empty-state-title`, `empty-state-description`, `empty-state-actions` | Use for no data, no results, or empty collections.                                 | Do not add extra explanatory panels around it.                          |

Safe override:

```css
.billing-page :where([data-slot="page-header-actions"]) {
  flex-wrap: wrap;
}
```

## Navbar

`Navbar` renders one `nav` root. Without `collapseAt`, children render inline.
With `collapseAt`, `NavBrand` children stay outside the collapsed region and the
remaining children move into a `details` disclosure.

| Component     | Shape                                          | Stable slots                                                                          | Aliases                                                           | Style here                                                                        | Avoid                                                                                  |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `Navbar`      | `nav` root, optionally with collapsed content. | `navbar`, `navbar-collapse`, `navbar-toggle`, `navbar-toggle-label`, `navbar-content` | None                                                              | Use `collapseAt` only when links should collapse below `sm`, `md`, `lg`, or `xl`. | Do not depend on old slots such as `navbar-shell`, `navbar-mobile`, or `navbar-panel`. |
| `NavBrand`    | Brand row, usually first child.                | `nav-brand`                                                                           | None                                                              | Use `asChild` for router links.                                                   | Do not place primary nav links inside the brand.                                       |
| `NavGroup`    | Optional group label plus body.                | `nav-group`, `nav-group-label`, `nav-group-body`                                      | None                                                              | Use for titled sidebar or grouped nav sections.                                   | Do not use for ordinary inline spacing.                                                |
| `NavItem`     | Anchor-like item with manual active state.     | `nav-item`                                                                            | `nav-item`, `navbar-item` from nav CSS                            | Use for external links or manual active state.                                    | Do not use for app routes when `NavLink` can handle matching.                          |
| `NavLink`     | Router-aware nav item.                         | `nav-item` by default                                                                 | `nav-item`, `navbar-item` from nav CSS                            | Use for app routes and `match="exact"` when needed.                               | Do not reimplement route active state in app code.                                     |
| `NavDropdown` | Single-level dropdown mounted in nav.          | `nav-dropdown`, `nav-dropdown-trigger`, `nav-dropdown-content`                        | Trigger receives `nav-item`; content receives `dropdown-content`. | Use for simple account or overflow menus.                                         | Do not use for multilevel product navigation; use overlay primitives directly.         |

Responsive rules:

- `collapseAt={false}` is the default; the navbar stays inline.
- `collapseAt="md"` means content collapses below the medium breakpoint.
- `NavBrand` remains visible outside collapsed content.
- Use a collapsed Navbar for crowded mobile topbars, not for simple auth
  headers with one or two actions.

Safe override:

```css
.app-header :where([data-slot="nav-brand"]) {
  font-weight: var(--ak-font-weight-semibold);
}

.app-header :where([data-slot="navbar-content"]) {
  justify-content: flex-end;
}
```

Common misuse: do not wrap `NavBrand` in another custom brand link component
when `asChild` already composes with the app router.

```tsx
<NavBrand asChild>
  <Link href="/">Askr</Link>
</NavBrand>
```

## Section Navigation

Use `Tabs`/`Tab` for local sections and `Pills`/`Pill` for compact rounded
navigation. These are separate names rather than variants because the visual
shape is the semantic choice.

| Component | Shape                         | Stable slots | Aliases         | Style here                                | Avoid                                                       |
| --------- | ----------------------------- | ------------ | --------------- | ----------------------------------------- | ----------------------------------------------------------- |
| `Tabs`    | Local section navigation root. | `tabs`       | `tabs`          | Use for section-level page navigation.    | Do not use for primary app chrome; use `Navbar`.            |
| `Tab`     | Router-aware tab link.         | `tab`        | `tab`           | Use `match="exact"` when needed.          | Do not style a `NavLink` into a tab.                        |
| `Pills`   | Compact rounded nav root.      | `pills`      | `pills`         | Use for small alternate route sets.       | Do not use for button-like filters or form state toggles.   |
| `Pill`    | Router-aware pill link.        | `pill`       | `pill`          | Use `active` for manual state if needed.  | Do not use as a removable chip; compose that recipe locally. |

```tsx
<Tabs aria-label="Settings sections">
  <Tab href="/settings/profile">Profile</Tab>
  <Tab href="/settings/billing">Billing</Tab>
</Tabs>
```

## Controls And Forms

Controls imported from `@askrjs/themes/controls` are styled through the theme
even when the behavior comes from `@askrjs/ui`.

| Component     | Shape                                                         | Stable slots                                                                                                                              | Aliases                                                                                                                                                         | Style here                                                    | Avoid                                                  |
| ------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| `Button`      | Interactive button or `asChild` trigger.                      | `button`, optional `theme-toggle-content` for `ThemeToggle` children.                                                                     | `btn`, `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`, `btn-destructive`, `btn-link`, `btn-sm`, `btn-lg`, `btn-icon`, `btn-close`                   | Use semantic variants and sizes before app CSS.               | Do not add app-specific button variants to core.       |
| `ButtonGroup` | Button grouping wrapper.                                      | `button-group`                                                                                                                            | `btn-group`, `btn-group-vertical`                                                                                                                               | Use `data-attached` and orientation state from the component. | Do not fake attached groups with negative margins.     |
| `Field`       | Form field wrapper.                                           | `field`                                                                                                                                   | `field`                                                                                                                                                         | Use to group label, control, hint, and error.                 | Do not use as a generic vertical stack outside forms.  |
| `FieldHint`   | Field helper text.                                            | `field-hint`                                                                                                                              | `field-hint`                                                                                                                                                    | Use for short persistent help.                                | Do not put validation errors here.                     |
| `FieldError`  | Field error text.                                             | `field-error`                                                                                                                             | `field-error`                                                                                                                                                   | Pair with invalid control state.                              | Do not render empty errors for spacing.                |
| `Label`       | Form label.                                                   | `label`                                                                                                                                   | `label`                                                                                                                                                         | Use real label/control association.                           | Do not replace labels with placeholders.               |
| `Input`       | Text input.                                                   | `input`                                                                                                                                   | `input`, `input-sm`, `input-lg`                                                                                                                                 | Use `aria-invalid` for error styling.                         | Do not add width props to `Input`; use parent `Block`. |
| `Textarea`    | Multiline input.                                              | `textarea`                                                                                                                                | `textarea`, `textarea-sm`, `textarea-lg`                                                                                                                        | Use for longer freeform text.                                 | Do not use for one-line fields.                        |
| `Select`      | Trigger, value, content, item, group, label, separator, text. | `select-trigger`, `select-value`, `select-content`, `select-item`, `select-item-text`, `select-group`, `select-label`, `select-separator` | `select-trigger`, `select-trigger-sm`, `select-trigger-lg`, `select-content`, `select-item`, `select-group`, `select-label`, `select-separator`, `select-value` | Style trigger and content slots.                              | Do not target generated option order.                  |
| `Checkbox`    | Checkbox control.                                             | `checkbox`                                                                                                                                | None                                                                                                                                                            | Use checked, indeterminate, disabled state attributes.        | Do not build custom checkboxes from `div`.             |
| `Switch`      | Toggle switch control.                                        | `switch`                                                                                                                                  | None                                                                                                                                                            | Use checked and disabled state attributes.                    | Do not use for one-time actions.                       |
| `InputGroup`  | Grouped controls and adornments.                              | `input-group`, `input-group-text`                                                                                                         | `input-group`, `input-group-vertical`, `input-group-text`                                                                                                       | Use for attached controls, prefixes, and suffixes.            | Do not use it as a toolbar.                            |

Safe override:

```css
.settings-form :where([data-slot="field-error"]) {
  margin-top: var(--ak-space-xs);
}

.settings-form :where([data-slot="input"][aria-invalid="true"]) {
  border-color: var(--ak-color-danger);
}
```

Common misuse: keep layout on the containing `Block`, not on individual
controls.

```tsx
<Block as="form" gap="md">
  <Field>
    <Label for="email">Email</Label>
    <Input id="email" name="email" type="email" />
    <FieldHint>Use your work email.</FieldHint>
  </Field>
</Block>
```

## Surfaces

| Component  | Shape                                                                   | Stable slots                                                                                                       | Aliases                                                                                                               | Style here                                                              | Avoid                                                                                             |
| ---------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `Card`     | Bordered content surface.                                               | `card`, `card-header`, `card-title`, `card-description`, `card-content`, `card-footer`, `card-actions`             | `card`, `card-raised`, `card-header`, `card-title`, `card-description`, `card-content`, `card-footer`, `card-actions` | Use for repeated surfaces, settings groups, and contained summaries.    | Do not call every bordered block a `Card`; `Block border radius` is enough for one-off structure. |
| `Alert`    | Inline feedback with optional icon, title, description, actions, close. | `alert`, `alert-icon`, `alert-content`, `alert-title`, `alert-description`, `alert-actions`, `alert-close`         | `alert`, `alert-info`, `alert-success`, `alert-warning`, `alert-danger` and child aliases                             | Use variants for status.                                                | Do not use `Alert` as page chrome.                                                                |
| `Badge`    | Small non-interactive status or metadata label.                         | `badge`                                                                                                            | `badge`, `badge-secondary`, `badge-outline`, `badge-success`, `badge-warning`, `badge-danger`, `badge-info`           | Use for state, plan, or metadata.                                       | Do not use for removable chips unless the interaction is composed locally.                        |
| `AspectRatio` | Media frame with fixed ratio.                                        | `aspect-ratio`                                                                                                     | None                                                                                                                  | Use for images, video, and previews.                                    | Do not use as a general layout wrapper.                                                             |
| `Avatar`   | User or entity image with fallback.                                      | `avatar`, `avatar-image`, `avatar-fallback`                                                                        | `avatar`, `avatar-image`, `avatar-fallback`                                                                           | Use for compact identity display.                                       | Do not use for decorative icons.                                                                  |
| `Progress` | Linear progress indicator.                                               | `progress`, `progress-indicator`                                                                                   | None                                                                                                                  | Use for determinate progress.                                           | Do not use for navigation or ratings.                                                             |
| `ProgressCircle` | Circular progress indicator.                                      | `progress-circle`, `progress-circle-indicator`                                                                     | None                                                                                                                  | Use for compact progress or custom loading states.                      | Prefer `Spinner` for ordinary indeterminate loading.                                               |
| `Table`    | Native table anatomy.                                                   | `table`, `table-caption`, `table-head`, `table-body`, `table-foot`, `table-row`, `table-header-cell`, `table-cell` | None                                                                                                                  | Use table slots for dense data surfaces.                                | Do not convert tabular data into card grids by default.                                           |
| `Skeleton` | Loading placeholder.                                                    | `skeleton`                                                                                                         | None                                                                                                                  | Give it explicit dimensions through `class`, `style`, or layout parent. | Do not render meaningful content inside skeletons.                                                |
| `Spinner`  | Indeterminate progress circle.                                          | `progress-circle`, `progress-circle-indicator`                                                                     | None                                                                                                                  | Use `label` or `aria-label`.                                            | Do not use for long page loads without surrounding status text.                                   |

Safe override:

```css
.project-card :where([data-slot="card-actions"]) {
  justify-content: flex-end;
}

.project-card :where([data-slot="badge"][data-variant="success"]) {
  font-weight: var(--ak-font-weight-medium);
}
```

## Overlays

Overlay behavior comes from `@askrjs/ui`; themed imports apply the default CSS.

| Component     | Stable slots                                                                                                                                  | Aliases                                                                                         | Style here                                                              | Avoid                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `Dialog`      | `dialog-trigger`, `dialog-overlay`, `dialog-content`, `dialog-title`, `dialog-description`, `dialog-close`                                    | None                                                                                            | Style content width, title spacing, and close affordance through slots. | Do not create a second `Modal` abstraction.                                |
| `AlertDialog` | Uses dialog slots for overlay/content/title/description plus action/cancel components.                                                        | None                                                                                            | Use for destructive confirmation flows.                                 | Do not use for ordinary edit forms.                                        |
| `Dropdown`    | `dropdown-trigger`, `dropdown-content`, `dropdown-item`, `dropdown-group`, `dropdown-label`, `dropdown-separator`                             | `dropdown-trigger`, `dropdown-content`, `dropdown-item`, `dropdown-label`, `dropdown-separator` | Style content and item slots.                                           | Do not target generated positioning wrappers.                              |
| `Popover`     | `popover-trigger`, `popover-content`, `popover-close`                                                                                         | None                                                                                            | Use for lightweight rich floating content.                              | Do not use for menus; use `Dropdown`.                                      |
| `Tooltip`     | `tooltip-trigger`, `tooltip-content`                                                                                                          | None                                                                                            | Keep content short.                                                     | Do not put interactive controls in tooltips.                               |
| `Toast`       | `toast-provider`, `toast-viewport`, `toast`, `toast-title`, `toast-description`, `toast-action`, `toast-close`                                | None                                                                                            | Style variants and viewport placement.                                  | Do not use toast for required decisions.                                   |

Safe override:

```css
.account-menu :where([data-slot="dropdown-content"]) {
  min-width: 14rem;
}

.account-menu :where([data-slot="dropdown-item"][data-disabled]) {
  opacity: 0.6;
}
```

## Theme Controls

| Component       | Shape                                                 | Stable slots                     | Style here                                      | Avoid                                                                              |
| --------------- | ----------------------------------------------------- | -------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `ThemeProvider` | Context provider plus DOM wrapper.                    | `theme-provider`                 | Rarely needed; prefer root token scopes.        | Do not target provider descendants by child order.                                 |
| `ThemePicker`   | Native select for available themes.                   | `theme-picker`                   | Style as a compact control.                     | Do not create custom theme menus unless product UI requires it.                    |
| `ThemeToggle`   | Styled `Button` that changes theme and wraps content. | `button`, `theme-toggle-content` | Use button variants/sizes and the content slot. | Do not hide it inside responsive nav collapse when it is a required global action. |

Safe override:

```css
.auth-header :where([data-theme-control="toggle"]) {
  flex-shrink: 0;
}
```

## Public Versus Internal

Public:

- Documented `data-slot` values.
- Documented alias classes.
- Semantic state attributes such as `data-active`, `data-state`,
  `data-disabled`, `aria-current`, and `aria-invalid`.
- Token variables documented in [Tokens](./tokens.md).

Internal:

- Child index selectors such as `:nth-child`.
- Generated overlay positioning wrappers.
- Old slot names not emitted by the current implementation.
- Component DOM depth beyond documented slots.
