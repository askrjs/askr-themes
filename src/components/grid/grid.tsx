import type { JSX } from "@askrjs/askr/jsx-runtime";
import { classes } from "../_internal/classes";
import { mergeLayoutStyles, resolveSpaceValue, setResponsiveVar } from "../_internal/block-layout";
import { mergeProps } from "../_internal/merge-props";
import { intrinsicElement } from "../_internal/jsx";
import { styleDeclarationsToClass } from "../_internal/style";
import type { BlockSpace } from "../_internal/block-layout";
import type { GridAlign, GridColumns, GridElement, GridProps } from "./grid.types";

const DEFAULT_ELEMENT = "div";
function resolveColumns(value: GridColumns): string {
  if (typeof value === "number") {
    return `repeat(${value}, minmax(0, 1fr))`;
  }

  const trimmed = value.trim();
  return trimmed || "minmax(0, 1fr)";
}

function resolveGap(value: BlockSpace): string {
  return String(resolveSpaceValue(value));
}

function resolveAlign(value: GridAlign): string {
  if (value === "start") return "start";
  if (value === "end") return "end";
  return value;
}

export function Grid<TElement extends GridElement = "div">(
  props: GridProps<TElement>,
): JSX.Element {
  const {
    as,
    columns,
    gap,
    align,
    children,
    class: classProp,
    className,
    ref,
    style: userStyle,
    ...rest
  } = props as GridProps<GridElement> & {
    class?: unknown;
    className?: unknown;
    style?: unknown;
  };

  const styles: Record<string, string | number> = {};
  setResponsiveVar(styles, "grid-columns", columns, resolveColumns);
  setResponsiveVar(styles, "grid-gap", gap, resolveGap);
  setResponsiveVar(styles, "grid-align", align, resolveAlign);

  const generatedClass = styleDeclarationsToClass(mergeLayoutStyles(styles, userStyle));
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("grid", classProp, className, generatedClass),
    "data-slot": "grid",
  });

  return intrinsicElement(as ?? DEFAULT_ELEMENT, finalProps, children);
}
