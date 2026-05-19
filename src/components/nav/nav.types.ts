import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";
import type { LinkProps } from "@askrjs/askr/router";

export type NavOrientation = "horizontal" | "vertical";
export type NavVariant = "default" | "tabs" | "pills";
export type NavItemVariant = "default" | "icon";
export type NavLinkMatch = "prefix" | "exact";

export type NavOwnProps = {
  children?: unknown;
  orientation?: NavOrientation;
  variant?: NavVariant;
  as?: "nav" | "div" | "ul";
};

export type NavNavProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref"> &
  NavOwnProps & {
    as?: "nav";
    asChild?: false;
    ref?: Ref<HTMLElement>;
  };

export type NavDivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref"> &
  NavOwnProps & {
    as: "div";
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type NavListProps = Omit<JSX.IntrinsicElements["ul"], "children" | "ref"> &
  NavOwnProps & {
    as: "ul";
    asChild?: false;
    ref?: Ref<HTMLUListElement>;
  };

export type NavAsChildProps = Omit<NavOwnProps, "as"> & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type NavProps = NavNavProps | NavDivProps | NavListProps | NavAsChildProps;

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

export type NavLinkOwnProps = NavItemOwnProps & {
  match?: NavLinkMatch;
};

export type NavLinkProps = LinkProps & NavLinkOwnProps;
