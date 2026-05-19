import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";

export type SeparatorOwnProps = {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
  children?: unknown;
};

export type SeparatorNativeProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref"> &
  SeparatorOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type SeparatorAsChildProps = SeparatorOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type SeparatorProps = SeparatorNativeProps | SeparatorAsChildProps;
