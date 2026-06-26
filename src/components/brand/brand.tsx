import { Slot } from "@askrjs/askr/foundations";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import type {
  BrandAsChildProps,
  BrandLabelProps,
  BrandMarkProps,
  BrandNativeProps,
  BrandProps,
} from "./brand.types";

const DEFAULT_ELEMENT = "div";

export function Brand<TElement extends "div" | "a" | "span" = "div">(
  props: BrandProps<TElement>,
): JSX.Element {
  const {
    as,
    asChild,
    children,
    class: classProp,
    className,
    ref,
    ...rest
  } = props as BrandNativeProps | BrandAsChildProps;

  const finalProps = mergeProps(rest, {
    ref,
    class: classes("brand", classProp, className),
    "data-slot": "brand",
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  const Element = (as ?? DEFAULT_ELEMENT) as keyof JSX.IntrinsicElements;
  return <Element {...finalProps}>{children}</Element>;
}

export function BrandMark(props: BrandMarkProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("brand-mark", className),
    "data-slot": "brand-mark",
  });

  return <span {...finalProps}>{children}</span>;
}

export function BrandLabel(props: BrandLabelProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("brand-label", className),
    "data-slot": "brand-label",
  });

  return <span {...finalProps}>{children}</span>;
}
