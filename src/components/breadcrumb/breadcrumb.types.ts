import type { JSXElement, Ref } from "@askrjs/askr/foundations";

export type BreadcrumbOwnProps = {
  children?: unknown;
  "aria-label"?: string;
};

export type BreadcrumbProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref"> &
  BreadcrumbOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLElement>;
  };

export type BreadcrumbAsChildProps = BreadcrumbOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type BreadcrumbListProps = Omit<JSX.IntrinsicElements["ol"], "children" | "ref"> & {
  asChild?: false;
  ref?: Ref<HTMLOListElement>;
};

export type BreadcrumbListAsChildProps = {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type BreadcrumbItemProps = Omit<JSX.IntrinsicElements["li"], "children" | "ref"> & {
  asChild?: false;
  ref?: Ref<HTMLLIElement>;
};

export type BreadcrumbItemAsChildProps = {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type BreadcrumbLinkProps = Omit<JSX.IntrinsicElements["a"], "children" | "ref"> & {
  asChild?: false;
  ref?: Ref<HTMLAnchorElement>;
};

export type BreadcrumbLinkAsChildProps = {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type BreadcrumbCurrentProps = Omit<JSX.IntrinsicElements["span"], "children" | "ref"> & {
  asChild?: false;
  ref?: Ref<HTMLSpanElement>;
};

export type BreadcrumbCurrentAsChildProps = {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type BreadcrumbSeparatorProps = Omit<JSX.IntrinsicElements["span"], "children" | "ref"> & {
  asChild?: false;
  ref?: Ref<HTMLSpanElement>;
};

export type BreadcrumbSeparatorAsChildProps = {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};
