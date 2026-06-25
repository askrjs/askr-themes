import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";
import type { LinkProps } from "@askrjs/askr/router";

export type NavLinkMatch = "prefix" | "exact";

export type TabsOwnProps = {
  children?: unknown;
};

export type TabsProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref"> &
  TabsOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLElement>;
  };

export type TabsAsChildProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref"> &
  TabsOwnProps & {
    asChild: true;
    children: JSXElement;
    ref?: Ref<unknown>;
  };

export type PillsOwnProps = {
  children?: unknown;
};

export type PillsProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref"> &
  PillsOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLElement>;
  };

export type PillsAsChildProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref"> &
  PillsOwnProps & {
    asChild: true;
    children: JSXElement;
    ref?: Ref<unknown>;
  };

export type NavItemOwnProps = {
  active?: boolean;
  children?: unknown;
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

export type TabProps = LinkProps & NavLinkOwnProps;

export type PillProps = LinkProps & NavLinkOwnProps;
