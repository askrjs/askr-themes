export type NavbarProps = Omit<JSX.IntrinsicElements["nav"], "children"> & {
  children?: unknown;
};

export type NavBrandProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  children?: unknown;
};

export type NavGroupProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  children?: unknown;
};

import type { JSXElement, Ref } from "@askrjs/ui/foundations";

export type NavItemVariant = "default" | "icon";

export type NavItemOwnProps = {
  children?: unknown;
  variant?: NavItemVariant;
};

export type NavItemProps = Omit<JSX.IntrinsicElements["a"], "children" | "ref"> &
  NavItemOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLAnchorElement>;
  };

export type NavItemAsChildProps = Omit<JSX.IntrinsicElements["a"], "children" | "ref"> &
  NavItemOwnProps & {
    asChild: true;
    children: JSXElement;
    ref?: Ref<unknown>;
  };
