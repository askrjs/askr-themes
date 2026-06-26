import type { BlockAsChildProps, BlockDivProps, BlockElementProps } from "../block";
import type { DropdownContentOwnProps, DropdownProps } from "@askrjs/ui";

export type NavbarCollapseBreakpoint = "sm" | "md" | "lg" | "xl";

export type NavbarProps = Omit<BlockElementProps<"nav">, "as" | "direction" | "align"> & {
  breakpoint?: NavbarCollapseBreakpoint | false;
  collapseAt?: NavbarCollapseBreakpoint | false;
  collapseLabel?: string;
  collapseIcon?: unknown;
};

export type NavBrandProps = BlockDivProps | BlockElementProps<"a"> | BlockAsChildProps;

export type NavGroupProps = Omit<BlockDivProps, "title"> & {
  label?: unknown;
  title?: unknown;
};

export type NavDropdownProps = Omit<DropdownProps, "children"> &
  Pick<DropdownContentOwnProps, "align" | "side" | "sideOffset"> & {
    label: unknown;
    children?: unknown;
  };
