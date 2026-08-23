# Changelog

## Unreleased

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
