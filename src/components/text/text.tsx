import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import type { TextElement, TextProps } from "./text.types";

const DEFAULT_ELEMENT = "p";

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

  const Element = (as ?? DEFAULT_ELEMENT) as keyof JSX.IntrinsicElements;
  return <Element {...finalProps}>{children}</Element>;
}
