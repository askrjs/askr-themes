import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Slot } from "@askrjs/askr/foundations";
import { classes } from "../_internal/classes";
import {
  applyBlockLayoutStyles,
  mergeLayoutStyles,
  splitBlockLayoutProps,
} from "../_internal/block-layout";
import { mergeProps } from "../_internal/merge-props";
import { intrinsicElement } from "../_internal/jsx";
import { styleDeclarationsToClass } from "../_internal/style";
import type { BlockAsChildProps, BlockNativeProps } from "./block.types";

const DEFAULT_ELEMENT = "div";

/**
 * Low-level layout primitive: renders any element in {@link BlockElement}
 * (default `<div>`) and turns layout-only props (spacing, alignment,
 * direction, sizing, etc.) into a generated utility class. With `asChild`,
 * the layout is merged onto a single child element instead of a wrapper.
 */
export function Block(props: BlockNativeProps): JSX.Element;
export function Block(props: BlockAsChildProps): JSX.Element;
export function Block(props: BlockNativeProps | BlockAsChildProps) {
  const {
    as: asProp,
    asChild,
    children,
    ref,
    class: classProp,
    className,
    style: userStyle,
    ...rest
  } = props as (BlockNativeProps | BlockAsChildProps) & {
    as?: BlockNativeProps["as"];
    class?: unknown;
    className?: unknown;
    style?: unknown;
  };
  const as = asProp ?? DEFAULT_ELEMENT;

  const { blockProps, rest: passthroughProps } = splitBlockLayoutProps(rest);
  const layoutStyle: Record<string, string | number> = {};
  applyBlockLayoutStyles(layoutStyle, blockProps);

  const layoutClass = styleDeclarationsToClass(mergeLayoutStyles(layoutStyle, userStyle));
  const slot =
    typeof (passthroughProps as Record<string, unknown>)["data-slot"] === "string"
      ? String((passthroughProps as Record<string, unknown>)["data-slot"])
      : "block";

  const finalProps = mergeProps(passthroughProps, {
    ref,
    class: classes(classProp, className, layoutClass),
    "data-slot": slot,
    "data-ak-layout": "true",
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return intrinsicElement(as ?? DEFAULT_ELEMENT, finalProps, children);
}
