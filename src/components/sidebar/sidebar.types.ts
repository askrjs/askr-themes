import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { BlockElementProps } from "../block";

/** How a {@link Sidebar} collapses: fully off-canvas, down to icons only, or not at all. */
export type SidebarCollapsible = "offcanvas" | "icon" | "none";
/** Which edge of the viewport a {@link Sidebar} is docked to. */
export type SidebarSide = "left" | "right";
/** Side a sidebar button's tooltip is positioned on. */
export type SidebarTooltipSide = "top" | "bottom" | "left" | "right";
/** Visual style of a {@link Sidebar}. */
export type SidebarVariant = "sidebar" | "floating" | "inset";

/** Props for the {@link Sidebar} component. */
export type SidebarProps = Omit<BlockElementProps<"aside">, "as" | "width" | "shrink"> & {
  collapsible?: SidebarCollapsible;
  side?: SidebarSide;
  variant?: SidebarVariant;
  width?: BlockElementProps<"aside">["width"];
  shrink?: BlockElementProps<"aside">["shrink"];
};

/** Props shared by the generic {@link Sidebar} structural parts (content, header, footer, group, etc.). */
export type SidebarPartProps = JSX.IntrinsicElements["div"] & {
  as?: keyof JSX.IntrinsicElements;
  asChild?: boolean;
};

/** Props shared by the interactive {@link Sidebar} button parts (menu button, action, trigger). */
export type SidebarButtonProps = JSX.IntrinsicElements["button"] & {
  active?: boolean;
  asChild?: boolean;
  size?: "default" | "sm" | "lg";
  tooltip?: string;
  tooltipSide?: SidebarTooltipSide;
  variant?: "default" | "outline";
};

/** Props for the {@link SidebarRail} component. */
export type SidebarRailProps = SidebarButtonProps;
