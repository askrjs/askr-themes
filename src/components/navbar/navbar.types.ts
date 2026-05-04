import type { JSXElement, Ref } from "@askrjs/askr/foundations";
import type { LinkProps } from "@askrjs/askr/router";

export type NavbarProps = Omit<JSX.IntrinsicElements["nav"], "children"> & {
  children?: unknown;
};

export type NavBrandProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  children?: unknown;
};

export type NavGroupProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  children?: unknown;
};

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

export type NavLinkProps = LinkProps & NavItemOwnProps;
