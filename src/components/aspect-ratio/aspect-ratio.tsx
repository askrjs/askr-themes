import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Slot } from "@askrjs/askr/foundations";
import { mergeProps } from "../_internal/merge-props";
import { mergeLayoutStyles } from "../_internal/block-layout";
import { generatedStyleBinding } from "../_internal/style";
import { intrinsicElement } from "../_internal/jsx";
import type { AspectRatioAsChildProps, AspectRatioProps } from "./aspect-ratio.types";

/**
 * Constrains its content to a fixed width/height ratio (defaults to `1`)
 * using a computed `aspect-ratio` style, rendering as a `<div>` or, with
 * `asChild`, merging its layout into the single child element.
 */
export function AspectRatio(props: AspectRatioProps): JSX.Element;
export function AspectRatio(props: AspectRatioAsChildProps): JSX.Element;
export function AspectRatio(props: AspectRatioProps | AspectRatioAsChildProps) {
  const { asChild, children, ratio = 1, ref, style, ...rest } = props;
  const layout = generatedStyleBinding(
    mergeLayoutStyles(
      {
        display: "block",
        width: "100%",
        aspectRatio: String(ratio),
        overflow: "hidden",
      },
      style,
    ),
    ref,
  );

  const finalProps = mergeProps(rest, {
    ref: layout.ref,
    "data-slot": "aspect-ratio",
    ...(layout.className ? { class: layout.className } : {}),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return intrinsicElement("div", finalProps, children);
}
