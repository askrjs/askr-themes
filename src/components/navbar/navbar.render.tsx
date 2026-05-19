import type { CollapseIconPlacement } from "../shell/shell-nav.types";

export function renderNavbarCollapseContents(
  collapseLabel: string,
  collapseIcon: unknown,
  collapseIconPlacement: CollapseIconPlacement,
): unknown {
  const icon = (
    <span data-slot="navbar-toggle-icon" aria-hidden="true">
      {collapseIcon ?? (
        <span class="navbar-toggle-glyph" data-slot="navbar-toggle-glyph">
          <span />
          <span />
          <span />
        </span>
      )}
    </span>
  );
  const label = <span data-slot="navbar-toggle-label">{collapseLabel}</span>;

  return collapseIconPlacement === "end" ? (
    <>
      {label}
      {icon}
    </>
  ) : (
    <>
      {icon}
      {label}
    </>
  );
}
