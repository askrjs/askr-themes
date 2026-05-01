import { Slot, mergeProps } from "@askrjs/askr/foundations";
import {
  applyBoxLayoutStyles,
  splitBoxLayoutProps,
  withBoxLayoutStyle,
} from "../_internal/box-layout";
import {
  isResponsiveValue,
  resolveAlignValue,
  resolveJustifyValue,
  resolveSpaceValue,
  serializeResponsiveValueIf,
  setResponsiveStyleVar,
} from "../_internal/layout";
import type { FlexAsChildProps, FlexDivProps, FlexSpanProps } from "./flex.types";

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

function isResponsiveObject(value: unknown): boolean {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isCssCoveredSpaceValue(value: unknown): value is string {
  return typeof value === "string" && SPACE_TOKENS.has(value.trim());
}

function isCssCoveredDirectionValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    ["row", "column", "row-reverse", "column-reverse"].includes(value.trim())
  );
}

function isCssCoveredAlignValue(value: unknown): value is string {
  return (
    typeof value === "string" &&
    ["start", "end", "center", "stretch", "baseline"].includes(value.trim())
  );
}

function isCssCoveredJustifyValue(value: unknown): value is string {
  return typeof value === "string" && ["start", "end", "center", "between"].includes(value.trim());
}

function isCssCoveredWrapValue(value: unknown): value is string {
  return typeof value === "string" && ["wrap", "nowrap", "wrap-reverse"].includes(value.trim());
}

function serializeStaticThemeValue<T>(
  value: T | Partial<Record<"initial" | "sm" | "md" | "lg" | "xl", T>> | undefined,
  predicate: (value: T) => boolean,
): string | undefined {
  if (isResponsiveValue(value)) return undefined;
  return serializeResponsiveValueIf(value, predicate);
}

const SLOTS = {
  root: "flex",
} as const;

export function Flex(props: FlexDivProps): JSX.Element;
export function Flex(props: FlexSpanProps): JSX.Element;
export function Flex(props: FlexAsChildProps): JSX.Element;
export function Flex(props: FlexDivProps | FlexSpanProps | FlexAsChildProps) {
  const as = "as" in props ? props.as : "div";
  const {
    asChild,
    children,
    direction = "row",
    gap,
    gapX,
    gapY,
    align,
    justify,
    wrap,
    collapseBelow,
    ref,
    style: userStyle,
    ...rest
  } = props;

  const { boxProps, rest: passthroughProps } = splitBoxLayoutProps(rest);
  const rootSlot =
    typeof (passthroughProps as Record<string, unknown>)["data-slot"] === "string"
      ? String((passthroughProps as Record<string, unknown>)["data-slot"])
      : SLOTS.root;
  const layoutStyle: Record<string, string | number> = {};
  applyBoxLayoutStyles(layoutStyle, boxProps);

  if (boxProps.display !== undefined) {
    setResponsiveStyleVar(layoutStyle, "display", boxProps.display, (value) => value);
  }
  if (
    direction !== "row" &&
    (!isCssCoveredDirectionValue(direction) || isResponsiveObject(direction))
  ) {
    setResponsiveStyleVar(layoutStyle, "flex-direction", direction, (value) => value);
  }
  if (!isCssCoveredSpaceValue(gap) || isResponsiveObject(gap)) {
    setResponsiveStyleVar(layoutStyle, "gap", gap, resolveSpaceValue);
  }
  if (!isCssCoveredSpaceValue(gapX) || isResponsiveObject(gapX)) {
    setResponsiveStyleVar(layoutStyle, "column-gap", gapX, resolveSpaceValue);
  }
  if (!isCssCoveredSpaceValue(gapY) || isResponsiveObject(gapY)) {
    setResponsiveStyleVar(layoutStyle, "row-gap", gapY, resolveSpaceValue);
  }
  if (!isCssCoveredAlignValue(align) || isResponsiveObject(align)) {
    setResponsiveStyleVar(layoutStyle, "align-items", align, resolveAlignValue);
  }
  if (!isCssCoveredJustifyValue(justify) || isResponsiveObject(justify)) {
    setResponsiveStyleVar(layoutStyle, "justify-content", justify, resolveJustifyValue);
  }
  if (!isCssCoveredWrapValue(wrap) || isResponsiveObject(wrap)) {
    setResponsiveStyleVar(layoutStyle, "flex-wrap", wrap, (value) => value);
  }

  const finalProps = mergeProps(passthroughProps, {
    ref,
    "data-slot": rootSlot,
    "data-ak-layout": "true",
    "data-direction": serializeStaticThemeValue(direction, isCssCoveredDirectionValue),
    "data-gap": serializeStaticThemeValue(gap, isCssCoveredSpaceValue),
    "data-gap-x": serializeStaticThemeValue(gapX, isCssCoveredSpaceValue),
    "data-gap-y": serializeStaticThemeValue(gapY, isCssCoveredSpaceValue),
    "data-align": serializeStaticThemeValue(align, isCssCoveredAlignValue),
    "data-justify": serializeStaticThemeValue(justify, isCssCoveredJustifyValue),
    "data-wrap": serializeStaticThemeValue(wrap, isCssCoveredWrapValue),
    "data-collapse-below": collapseBelow,
    style: withBoxLayoutStyle(layoutStyle, userStyle),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  if (as === "span") {
    return <span {...finalProps}>{children}</span>;
  }

  return <div {...finalProps}>{children}</div>;
}
