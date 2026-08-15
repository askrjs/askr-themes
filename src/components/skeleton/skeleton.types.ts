import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/** Props shared by both {@link Skeleton} call signatures. */
export type SkeletonOwnProps = {
  children?: unknown;
  height?: string | number;
  width?: string | number;
};

/** Props for {@link Skeleton} rendered as its default `<div>` element. */
export type SkeletonProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref"> &
  SkeletonOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

/** Props for {@link Skeleton} rendered with `asChild`, merging its attributes onto a single child element. */
export type SkeletonAsChildProps = SkeletonOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};
