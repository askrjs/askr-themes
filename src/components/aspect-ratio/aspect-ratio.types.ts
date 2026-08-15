import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/** Props shared by both {@link AspectRatio} call signatures. */
export type AspectRatioOwnProps = {
  children?: unknown;
  ratio?: number | string;
  style?: unknown;
};

/** Props for {@link AspectRatio} rendered as its default `<div>` element. */
export type AspectRatioProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref"> &
  AspectRatioOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

/** Props for {@link AspectRatio} rendered with `asChild`, merging layout onto a single child element. */
export type AspectRatioAsChildProps = AspectRatioOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};
