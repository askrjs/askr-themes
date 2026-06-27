import type { BlockElementProps } from "../block";

export type SidebarCollapsible = "offcanvas" | "icon" | "none";
export type SidebarSide = "left" | "right";
export type SidebarTooltipSide = "top" | "bottom" | "left" | "right";
export type SidebarVariant = "sidebar" | "floating" | "inset";

export type SidebarProps = Omit<BlockElementProps<"aside">, "as" | "width" | "shrink"> & {
  collapsible?: SidebarCollapsible;
  side?: SidebarSide;
  variant?: SidebarVariant;
  width?: BlockElementProps<"aside">["width"];
  shrink?: BlockElementProps<"aside">["shrink"];
};

export type SidebarPartProps = JSX.IntrinsicElements["div"] & {
  as?: keyof JSX.IntrinsicElements;
  asChild?: boolean;
};

export type SidebarButtonProps = JSX.IntrinsicElements["button"] & {
  active?: boolean;
  asChild?: boolean;
  size?: "default" | "sm" | "lg";
  tooltip?: string;
  tooltipSide?: SidebarTooltipSide;
  variant?: "default" | "outline";
};
