import type { BlockAsChildProps, BlockDivProps, BlockElementProps } from "../block";
import type { DropdownContentOwnProps, DropdownProps } from "@askrjs/ui";

export type NavbarCollapseBreakpoint = "sm" | "md" | "lg" | "xl";
export type NavbarMenuAlign = "start" | "center" | "end";

export type NavbarProps = Omit<BlockElementProps<"nav">, "as" | "direction" | "align"> & {
  collapseAt?: NavbarCollapseBreakpoint | false;
  collapseLabel?: string;
  collapseIcon?: unknown;
  menuAlign?: NavbarMenuAlign;
};

export type NavBrandProps = BlockDivProps | BlockElementProps<"a"> | BlockAsChildProps;

export type NavGroupProps = Omit<BlockDivProps, "title"> & {
  title?: unknown;
};

export type NavDropdownProps = Omit<DropdownProps, "children"> &
  Pick<DropdownContentOwnProps, "align" | "side" | "sideOffset"> & {
    label: unknown;
    children?: unknown;
  };
