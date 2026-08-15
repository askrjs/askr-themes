import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";
import type { LinkProps } from "@askrjs/askr/router";

/** Route-matching strategy for {@link NavLinkProps.match}: `"prefix"` matches sub-routes, `"exact"` requires an identical path. */
export type NavLinkMatch = "prefix" | "exact";

/** Props shared by both {@link Tabs} call signatures. */
export type TabsOwnProps = {
  children?: unknown;
};

/** Props for {@link Tabs} rendered as its default `<nav>` element. */
export type TabsProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref"> &
  TabsOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLElement>;
  };

/** Props for {@link Tabs} rendered with `asChild`, merging onto a single child element. */
export type TabsAsChildProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref"> &
  TabsOwnProps & {
    asChild: true;
    children: JSXElement;
    ref?: Ref<unknown>;
  };

/** Props shared by both {@link Pills} call signatures. */
export type PillsOwnProps = {
  children?: unknown;
};

/** Props for {@link Pills} rendered as its default `<nav>` element. */
export type PillsProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref"> &
  PillsOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLElement>;
  };

/** Props for {@link Pills} rendered with `asChild`, merging onto a single child element. */
export type PillsAsChildProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref"> &
  PillsOwnProps & {
    asChild: true;
    children: JSXElement;
    ref?: Ref<unknown>;
  };

/** Props shared by both {@link NavItem} call signatures. */
export type NavItemOwnProps = {
  active?: boolean;
  children?: unknown;
};

/** Props for {@link NavItem} rendered as its default `<a>` element. */
export type NavItemProps = Omit<JSX.IntrinsicElements["a"], "children" | "ref"> &
  NavItemOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLAnchorElement>;
  };

/** Props for {@link NavItem} rendered with `asChild`, merging onto a single child element. */
export type NavItemAsChildProps = Omit<JSX.IntrinsicElements["a"], "children" | "ref"> &
  NavItemOwnProps & {
    asChild: true;
    children: JSXElement;
    ref?: Ref<unknown>;
  };

/** Props shared by {@link NavLink}, {@link Tab}, and {@link Pill}. */
export type NavLinkOwnProps = NavItemOwnProps & {
  match?: NavLinkMatch;
  onPress?: (event: Event) => void;
};

/** Props for the {@link NavLink} component. */
export type NavLinkProps = LinkProps & NavLinkOwnProps;

/** Props for the {@link Tab} component. */
export type TabProps = LinkProps & NavLinkOwnProps;

/** Props for the {@link Pill} component. */
export type PillProps = LinkProps & NavLinkOwnProps;
