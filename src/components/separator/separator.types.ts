import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/** Props shared by both {@link Separator} call signatures. */
export type SeparatorOwnProps = {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
  children?: unknown;
};

/** Props for {@link Separator} rendered as its default `<div>` element. */
export type SeparatorNativeProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref"> &
  SeparatorOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

/** Props for {@link Separator} rendered with `asChild`, merging its attributes onto a single child element. */
export type SeparatorAsChildProps = SeparatorOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

/** Union of all prop shapes accepted by {@link Separator}. */
export type SeparatorProps = SeparatorNativeProps | SeparatorAsChildProps;
