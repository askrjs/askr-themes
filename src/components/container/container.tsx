import { Slot } from "@askrjs/askr/foundations";
import { mergeProps } from "../_internal/merge-props";
import {
  applyBoxLayoutStyles,
  splitBoxLayoutProps,
  withBoxLayoutStyle,
} from "../_internal/box-layout";
import {
  isResponsiveValue,
  resolveContainerSizeValue,
  resolveInlineAlignValue,
  resolveSpaceValue,
  serializeResponsiveValueIf,
  setResponsiveStyleVar,
} from "../_internal/layout";
import type { ContainerAsChildProps, ContainerNativeProps } from "./container.types";

const CONTAINER_WIDTH_TOKENS = new Set(["1", "2", "3", "4", "sm", "md", "lg", "xl"]);

function isContainerWidthToken(value: unknown): value is string {
  return typeof value === "string" && CONTAINER_WIDTH_TOKENS.has(value.trim());
}

function isContainerAlignToken(value: unknown): value is "left" | "center" | "right" {
  return typeof value === "string" && ["left", "center", "right"].includes(value.trim());
}

function hasStyleValue(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length > 0;
  }

  return false;
}

function isStaticValue(value: unknown): boolean {
  return !isResponsiveValue(value as Record<string, unknown> | undefined);
}

export function Container(props: ContainerNativeProps): JSX.Element;
export function Container(props: ContainerAsChildProps): JSX.Element;
export function Container(props: ContainerNativeProps | ContainerAsChildProps) {
  const {
    asChild,
    children,
    variant,
    fluid = false,
    maxWidth,
    padding,
    size,
    align = "center",
    ref,
    style: userStyle,
    ...rest
  } = props;

  const responsiveVariant =
    fluid || (size === undefined && maxWidth === undefined)
      ? fluid
        ? "fluid"
        : (variant ?? "default")
      : undefined;

  const { boxProps, rest: passthroughProps } = splitBoxLayoutProps(rest);
  const layoutStyle: Record<string, string | number> = {
    boxSizing: "border-box",
    width: "100%",
  };
  applyBoxLayoutStyles(layoutStyle, boxProps);

  const widthValue = fluid ? undefined : (maxWidth ?? size);
  const usesInlineMaxWidth =
    boxProps.maxWidth === undefined &&
    widthValue !== undefined &&
    (isResponsiveValue(widthValue) || !isContainerWidthToken(widthValue));

  if (usesInlineMaxWidth) {
    setResponsiveStyleVar(layoutStyle, "max-width", widthValue, (value) =>
      typeof value === "string" && isContainerWidthToken(value)
        ? resolveContainerSizeValue(value)
        : value,
    );
  }

  if (
    padding !== undefined &&
    boxProps.px === undefined &&
    boxProps.pl === undefined &&
    boxProps.pr === undefined
  ) {
    setResponsiveStyleVar(layoutStyle, "px", padding, resolveSpaceValue);
  }

  const applyAlign = (side: "marginLeft" | "marginRight", value: typeof align) => {
    setResponsiveStyleVar(layoutStyle, side === "marginLeft" ? "ml" : "mr", value, (input) => {
      const margins = resolveInlineAlignValue(input);
      return side === "marginLeft" ? margins.marginLeft : margins.marginRight;
    });
  };

  if (boxProps.ml === undefined && boxProps.mr === undefined && isResponsiveValue(align)) {
    applyAlign("marginLeft", align);
    applyAlign("marginRight", align);
  }

  const mergedStyle =
    Object.keys(layoutStyle).length > 2 || hasStyleValue(userStyle)
      ? withBoxLayoutStyle(layoutStyle, userStyle)
      : undefined;

  const finalProps = mergeProps(passthroughProps, {
    ref,
    "data-slot": "container",
    "data-ak-layout": "true",
    "data-variant": responsiveVariant,
    "data-fluid": fluid ? "true" : undefined,
    "data-size": fluid
      ? undefined
      : isStaticValue(size)
        ? serializeResponsiveValueIf(size, isContainerWidthToken)
        : undefined,
    "data-align": isStaticValue(align)
      ? serializeResponsiveValueIf(align, isContainerAlignToken)
      : undefined,
    "data-max-width": fluid
      ? undefined
      : isStaticValue(maxWidth)
        ? serializeResponsiveValueIf(maxWidth, isContainerWidthToken)
        : undefined,
    style: mergedStyle,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}
