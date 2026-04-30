import { Slot, mergeProps } from "@askrjs/askr/foundations";
import { isCssLength, mergeLayoutStyles } from "../_internal/layout";
import { isJsxElement, toChildArray } from "../_internal/jsx";
import type { SpacerAsChildProps, SpacerNativeProps } from "./spacer.types";

export function Spacer(props: SpacerNativeProps): JSX.Element;
export function Spacer(props: SpacerAsChildProps): JSX.Element;
export function Spacer(props: SpacerNativeProps | SpacerAsChildProps) {
  const { asChild, children, grow, shrink, basis, axis, ref, style: userStyle, ...rest } = props;

  const layoutStyle: Record<string, string | number> = {};

  if (axis === "inline") {
    if (shrink !== undefined && shrink !== 0) {
      layoutStyle.flexShrink = shrink;
    }
    if (isCssLength(basis)) layoutStyle.width = basis!;
  } else if (axis === "block") {
    if (shrink !== undefined && shrink !== 0) {
      layoutStyle.flexShrink = shrink;
    }
    if (isCssLength(basis)) layoutStyle.height = basis!;
  } else {
    if (grow !== undefined && grow !== 1) {
      layoutStyle.flexGrow = grow;
    }
    if (shrink !== undefined && shrink !== 1) {
      layoutStyle.flexShrink = shrink;
    }
    if (isCssLength(basis)) {
      layoutStyle.flexBasis = basis!;
    }
  }

  const finalProps = mergeProps(rest, {
    ref,
    "data-slot": "spacer",
    "data-axis": axis,
    style: mergeLayoutStyles(layoutStyle, userStyle),
  });
  const keyedChildren = toChildArray(children).map((child, index) => {
    if (!isJsxElement(child) || child.key != null) {
      return child;
    }

    return {
      ...child,
      key: `spacer-${index}`,
    };
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{keyedChildren}</div>;
}
