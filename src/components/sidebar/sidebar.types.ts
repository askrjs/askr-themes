import type {
  CollapseBreakpoint,
  CollapseIconPlacement,
  Collapsible,
} from "../shell/shell-nav.types";

export type SidebarProps = Omit<JSX.IntrinsicElements["nav"], "children"> & {
  children?: unknown;
  breakpoint?: CollapseBreakpoint;
  collapseIcon?: unknown;
  collapseIconPlacement?: CollapseIconPlacement;
  collapsed?: boolean;
  collapseLabel?: string;
  collapsible?: Collapsible;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

export type SidebarToggleProps = Omit<
  JSX.IntrinsicElements["button"],
  "children" | "onClick" | "type"
> & {
  collapsedIcon: unknown;
  expandedIcon: unknown;
};

export type SidebarPanelProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  active?: boolean;
  brand?: unknown;
  children?: unknown;
  collapseLabel?: string;
  onClose?: () => void;
  open?: boolean;
  panelId?: string;
};
