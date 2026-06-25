import { Slot } from "@askrjs/askr/foundations";
import { mergeProps } from "../_internal/merge-props";
import { mergeLayoutStyles } from "../_internal/block-layout";
import { styleDeclarationsToClass } from "../_internal/style";
import type { AspectRatioAsChildProps, AspectRatioProps } from "./aspect-ratio.types";

export function AspectRatio(props: AspectRatioProps): JSX.Element;
export function AspectRatio(props: AspectRatioAsChildProps): JSX.Element;
export function AspectRatio(props: AspectRatioProps | AspectRatioAsChildProps) {
  const { asChild, children, ratio = 1, ref, style, ...rest } = props;
  const layoutClass = styleDeclarationsToClass(
    mergeLayoutStyles(
      {
        display: "block",
        width: "100%",
        aspectRatio: String(ratio),
        overflow: "hidden",
      },
      style,
    ),
  );

  const finalProps = mergeProps(rest, {
    ref,
    "data-slot": "aspect-ratio",
    ...(layoutClass ? { class: layoutClass } : {}),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
