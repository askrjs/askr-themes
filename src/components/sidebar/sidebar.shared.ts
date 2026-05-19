import { NAVBAR_COLLAPSE_BREAKPOINTS, isNavbarCollapsed } from "../navbar/navbar.shared";
import type { CollapseBreakpoint, Collapsible } from "../shell/shell-nav.types";

export { NAVBAR_COLLAPSE_BREAKPOINTS, isNavbarCollapsed };

export function resolveSidebarCollapsible(collapsible: Collapsible | undefined): Collapsible {
  return collapsible ?? "none";
}

export function isSidebarCollapsed(breakpoint: CollapseBreakpoint): boolean {
  return isNavbarCollapsed(breakpoint);
}
