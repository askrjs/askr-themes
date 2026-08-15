import type { BlockAsChildProps, BlockDivProps, BlockElementProps } from "../block";
import type { DropdownContentOwnProps, DropdownProps } from "@askrjs/ui";

/** Breakpoint at which a {@link Navbar} collapses non-brand content behind a toggle. */
export type NavbarCollapseBreakpoint = "sm" | "md" | "lg" | "xl";

/** Props for the {@link Navbar} component. */
export type NavbarProps = Omit<BlockElementProps<"nav">, "as" | "direction" | "align"> & {
  breakpoint?: NavbarCollapseBreakpoint | false;
  collapseAt?: NavbarCollapseBreakpoint | false;
  collapseLabel?: string;
  collapseIcon?: unknown;
};

/** Props for the {@link NavBrand} component. */
export type NavBrandProps = BlockDivProps | BlockElementProps<"a"> | BlockAsChildProps;

/** Props for the {@link NavGroup} component. */
export type NavGroupProps = Omit<BlockDivProps, "title"> & {
  label?: unknown;
  title?: unknown;
};

/** Props for the {@link NavDropdown} component. */
export type NavDropdownProps = Omit<DropdownProps, "children"> &
  Pick<DropdownContentOwnProps, "align" | "side" | "sideOffset"> & {
    label: unknown;
    children?: unknown;
  };
