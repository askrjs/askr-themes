import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Slot } from "@askrjs/askr/foundations";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import { intrinsicElement } from "../_internal/jsx";
import type {
  BrandAsChildProps,
  BrandLabelProps,
  BrandMarkProps,
  BrandNativeProps,
  BrandProps,
} from "./brand.types";

const DEFAULT_ELEMENT = "div";

/** Renders a brand/logo wrapper, defaulting to a `<div>` (or `<a>`/`<span>` via `as`), or merges onto a single child via `asChild`. */
export function Brand<TElement extends "div" | "a" | "span" = "div">(
  props: BrandProps<TElement>,
): JSX.Element {
  const {
    as: asProp,
    asChild,
    children,
    class: classProp,
    className,
    ref,
    ...rest
  } = props as (BrandNativeProps | BrandAsChildProps) & {
    as?: "div" | "a" | "span";
  };
  const as = asProp;

  const finalProps = mergeProps(rest, {
    ref,
    class: classes("brand", classProp, className),
    "data-slot": "brand",
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return intrinsicElement(as ?? DEFAULT_ELEMENT, finalProps, children);
}

/** Renders the icon/mark portion of a {@link Brand}. */
export function BrandMark(props: BrandMarkProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("brand-mark", className),
    "data-slot": "brand-mark",
  });

  return <span {...finalProps}>{children}</span>;
}

/** Renders the text label portion of a {@link Brand}. */
export function BrandLabel(props: BrandLabelProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("brand-label", className),
    "data-slot": "brand-label",
  });

  return <span {...finalProps}>{children}</span>;
}
