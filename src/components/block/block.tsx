import { Slot } from "@askrjs/askr/foundations";
import { mergeProps } from "../_internal/merge-props";
import { serializeResponsiveValueIf } from "../_internal/layout";
import type { BlockAsChildProps, BlockDivProps, BlockSpanProps } from "./block.types";

const SPACE_TOKENS = new Set([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
]);

export function Block(props: BlockDivProps): JSX.Element;
export function Block(props: BlockSpanProps): JSX.Element;
export function Block(props: BlockAsChildProps): JSX.Element;
export function Block(props: BlockDivProps | BlockSpanProps | BlockAsChildProps) {
  const as = "as" in props ? props.as : "div";
  const { asChild, children, gap, gapX, gapY, align, justify, size = "md", ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    "data-slot": "block",
    "data-ak-layout": "true",
    "data-gap": serializeResponsiveValueIf(
      gap,
      (value) => typeof value === "string" && SPACE_TOKENS.has(value.trim()),
    ),
    "data-gap-x": serializeResponsiveValueIf(
      gapX,
      (value) => typeof value === "string" && SPACE_TOKENS.has(value.trim()),
    ),
    "data-gap-y": serializeResponsiveValueIf(
      gapY,
      (value) => typeof value === "string" && SPACE_TOKENS.has(value.trim()),
    ),
    "data-align": serializeResponsiveValueIf(
      align,
      (value) =>
        typeof value === "string" &&
        ["start", "end", "center", "stretch", "baseline"].includes(value.trim()),
    ),
    "data-justify": serializeResponsiveValueIf(
      justify,
      (value) =>
        typeof value === "string" && ["start", "end", "center", "between"].includes(value.trim()),
    ),
    "data-size": `initial:${size}`,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  if (as === "span") {
    return <span {...finalProps}>{children}</span>;
  }

  return <div {...finalProps}>{children}</div>;
}
