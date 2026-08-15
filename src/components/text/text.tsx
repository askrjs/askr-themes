import type { JSX } from "@askrjs/askr/jsx-runtime";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import { intrinsicElement } from "../_internal/jsx";
import type { TextElement, TextProps } from "./text.types";

const DEFAULT_ELEMENT = "p";

/** Typography primitive: renders any {@link TextElement} (default `<p>`) and turns `size`/`tone`/`weight`/`font`/`numeric`/`wrap`/`truncate` into data attributes for CSS styling. */
export function Text<TElement extends TextElement = "p">(props: TextProps<TElement>): JSX.Element {
  const {
    as,
    size = "md",
    tone = "default",
    weight,
    font,
    numeric,
    wrap,
    truncate,
    children,
    class: classProp,
    className,
    ref,
    ...rest
  } = props as TextProps<TextElement> & { class?: unknown; className?: unknown };

  const finalProps = mergeProps(rest, {
    ref,
    class: classes("text", classProp, className),
    "data-slot": "text",
    "data-size": size,
    "data-tone": tone,
    "data-weight": weight,
    "data-font": font && font !== "body" ? font : undefined,
    "data-numeric": numeric && numeric !== "normal" ? numeric : undefined,
    "data-wrap": wrap,
    "data-truncate": truncate ? "true" : undefined,
  });

  return intrinsicElement(as ?? DEFAULT_ELEMENT, finalProps, children);
}
