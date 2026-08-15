import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/** Visual tone of a {@link BadgeProps} badge. */
export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "info";

/** Props shared by both {@link Badge} call signatures. */
export type BadgeOwnProps = {
  children?: unknown;
  variant?: BadgeVariant;
};

/** Props for {@link Badge} rendered as its default `<span>` element. */
export type BadgeProps = Omit<JSX.IntrinsicElements["span"], "children" | "ref"> &
  BadgeOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLSpanElement>;
  };

/** Props for {@link Badge} rendered with `asChild`, merging its attributes onto a single child element. */
export type BadgeAsChildProps = BadgeOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};
