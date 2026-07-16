import { Slot } from "@askrjs/askr/foundations";
import { mergeLayoutStyles } from "../_internal/block-layout";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import { intrinsicElement } from "../_internal/jsx";
import { styleDeclarationsToClass } from "../_internal/style";
import type { SkeletonAsChildProps, SkeletonProps } from "./skeleton.types";

function resolveSkeletonDimension(value: string | number | undefined): string | undefined {
  if (typeof value === "number") return `${value}px`;
  return value;
}

export function Skeleton(props: SkeletonProps): JSX.Element;
export function Skeleton(props: SkeletonAsChildProps): JSX.Element;
export function Skeleton(props: SkeletonProps | SkeletonAsChildProps) {
  const {
    asChild,
    children,
    class: classProp,
    className,
    height,
    ref,
    style,
    width,
    ...rest
  } = props as (SkeletonProps | SkeletonAsChildProps) & {
    class?: unknown;
    className?: unknown;
    style?: unknown;
  };
  const dimensions: Record<string, string | number> = {};
  const blockSize = resolveSkeletonDimension(height);
  const inlineSize = resolveSkeletonDimension(width);
  if (blockSize !== undefined) dimensions.blockSize = blockSize;
  if (inlineSize !== undefined) dimensions.inlineSize = inlineSize;
  const layoutClass = styleDeclarationsToClass(mergeLayoutStyles(dimensions, style));
  const finalProps = mergeProps(rest, {
    ref,
    class: classes(classProp, className, layoutClass),
    "data-slot": "skeleton",
    "data-skeleton": "true",
    "aria-hidden": "true",
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return intrinsicElement("div", finalProps, children);
}
