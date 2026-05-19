import type { CollapseIconPlacement } from "../shell/shell-nav.types";

export function renderNavbarCollapseContents(
  collapseLabel: string,
  collapseIcon: unknown,
  collapseIconPlacement: CollapseIconPlacement,
): unknown {
  if (collapseIcon === undefined) {
    return <span data-slot="navbar-toggle-label">{collapseLabel}</span>;
  }

  const icon = <span data-slot="navbar-toggle-icon">{collapseIcon}</span>;
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
