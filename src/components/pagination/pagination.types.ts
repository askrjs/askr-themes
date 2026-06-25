import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";

type PaginationNavProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref" | "aria-label">;
type LiProps = Omit<JSX.IntrinsicElements["li"], "children" | "ref">;
type AnchorProps = Omit<JSX.IntrinsicElements["a"], "children" | "ref">;

export type PaginationProps = PaginationNavProps & {
  children?: unknown;
  label?: string;
  ref?: Ref<HTMLElement>;
};

export type PaginationItemProps = LiProps & {
  active?: boolean;
  asChild?: false;
  children?: unknown;
  disabled?: boolean;
  ref?: Ref<HTMLLIElement>;
};

export type PaginationItemAsChildProps = LiProps & {
  active?: boolean;
  asChild: true;
  children: JSXElement;
  disabled?: boolean;
  ref?: Ref<unknown>;
};

export type PaginationLinkProps = AnchorProps & {
  active?: boolean;
  children?: unknown;
  disabled?: boolean;
  href: string;
  ref?: Ref<HTMLAnchorElement>;
};

export type PaginationEllipsisProps = Omit<JSX.IntrinsicElements["span"], "children" | "ref"> & {
  children?: unknown;
  ref?: Ref<HTMLSpanElement>;
};
