export type {
  NavItemAsChildProps,
  NavItemProps,
  NavItemVariant,
  NavLinkProps,
} from "../nav/nav.types";
import type { CollapseBreakpoint, CollapseIconPlacement } from "../shell/shell-nav.types";

export type NavGroupAlign = "start" | "center" | "end";

export type NavbarProps = Omit<JSX.IntrinsicElements["nav"], "children"> & {
  children?: unknown;
  breakpoint?: CollapseBreakpoint;
};
export type NavBrandProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  children?: unknown;
};

export type NavToggleProps = Omit<
  JSX.IntrinsicElements["button"],
  "children" | "type" | "onClick"
> & {
  children?: unknown;
  active?: boolean;
  icon?: unknown;
  iconPlacement?: CollapseIconPlacement;
  label?: string;
  onToggle?: () => void;
  open?: boolean;
  panelId?: string;
};

export type NavbarPanelProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  active?: boolean;
  brand?: unknown;
  children?: unknown;
  collapseLabel?: string;
  onClose?: () => void;
  open?: boolean;
  panelId?: string;
};

export type NavGroupProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  align?: NavGroupAlign;
  children?: unknown;
  label?: unknown;
};
