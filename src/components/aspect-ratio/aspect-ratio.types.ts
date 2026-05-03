import type { JSXElement, Ref } from "@askrjs/askr/foundations";

export type AspectRatioOwnProps = {
  children?: unknown;
  ratio?: number | string;
  style?: unknown;
};

export type AspectRatioProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref"> &
  AspectRatioOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type AspectRatioAsChildProps = AspectRatioOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};
