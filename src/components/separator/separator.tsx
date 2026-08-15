import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Slot } from "@askrjs/askr/foundations";
import { mergeProps } from "../_internal/merge-props";
import { intrinsicElement } from "../_internal/jsx";
import type { SeparatorAsChildProps, SeparatorNativeProps } from "./separator.types";

/**
 * Visual divider, defaulting to horizontal `role="separator"`; pass
 * `decorative` to drop the semantic role, or `asChild` to merge onto a
 * single child element.
 */
export function Separator(props: SeparatorNativeProps): JSX.Element;
export function Separator(props: SeparatorAsChildProps): JSX.Element;
export function Separator(props: SeparatorNativeProps | SeparatorAsChildProps) {
  const { asChild, children, decorative = false, orientation = "horizontal", ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    "data-slot": "separator",
    "data-orientation": orientation,
    role: decorative ? "presentation" : "separator",
    "aria-orientation": decorative ? undefined : orientation,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return intrinsicElement("div", finalProps, children);
}
