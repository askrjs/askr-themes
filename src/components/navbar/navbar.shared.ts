import type { CollapseBreakpoint } from "../shell/shell-nav.types";
import type { NavGroupAlign } from "./navbar.types";

export const NAVBAR_COLLAPSE_BREAKPOINTS: Record<CollapseBreakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function resolveNavGroupAlign(align: NavGroupAlign | undefined): string | undefined {
  return align === "start" ? undefined : align;
}

export function isNavbarCollapsed(collapseBelow: CollapseBreakpoint): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.innerWidth < NAVBAR_COLLAPSE_BREAKPOINTS[collapseBelow];
}
