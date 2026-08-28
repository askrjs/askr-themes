import type { JSX } from "@askrjs/askr/jsx-runtime";
import { classes } from "../_internal/classes";
import { intrinsicElement } from "../_internal/jsx";
import { mergeProps } from "../_internal/merge-props";
import type { HeadingProps } from "./heading.types";

/** Native semantic heading whose visual size is independent from its explicit document level. */
export function Heading({ level, ...props }: HeadingProps): JSX.Element {
  const {
    size = "lg",
    tone = "default",
    weight = "bold",
    font,
    numeric,
    wrap,
    truncate,
    children,
    class: classProp,
    className,
    ref,
    ...rest
  } = props as HeadingProps & { class?: unknown; className?: unknown };
  return intrinsicElement(
    `h${level}` as "h1",
    mergeProps(rest, {
      ref,
      class: classes("text", classProp, className),
      "data-slot": "text",
      "data-heading-level": String(level),
      "data-size": size,
      "data-tone": tone,
      "data-weight": weight,
      "data-font": font && font !== "body" ? font : undefined,
      "data-numeric": numeric && numeric !== "normal" ? numeric : undefined,
      "data-wrap": wrap,
      "data-truncate": truncate ? "true" : undefined,
    }),
    children,
  );
}
