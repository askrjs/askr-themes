import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";

export type ListGroupOrientation = "vertical" | "horizontal";

type UlProps = Omit<JSX.IntrinsicElements["ul"], "children" | "ref">;
type LiProps = Omit<JSX.IntrinsicElements["li"], "children" | "ref">;

export type ListGroupProps = UlProps & {
  children?: unknown;
  flush?: boolean;
  orientation?: ListGroupOrientation;
  ref?: Ref<HTMLUListElement>;
};

export type ListGroupItemProps = LiProps & {
  action?: boolean;
  active?: boolean;
  asChild?: false;
  children?: unknown;
  disabled?: boolean;
  ref?: Ref<HTMLLIElement>;
};

export type ListGroupItemAsChildProps = LiProps & {
  action?: boolean;
  active?: boolean;
  asChild: true;
  children: JSXElement;
  disabled?: boolean;
  ref?: Ref<unknown>;
};
