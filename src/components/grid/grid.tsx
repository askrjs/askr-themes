import { classes } from "../_internal/classes";
import { mergeLayoutStyles } from "../_internal/block-layout";
import { mergeProps } from "../_internal/merge-props";
import { styleDeclarationsToClass } from "../_internal/style";
import type { BlockSpace, LayoutBreakpoint, ResponsiveValue } from "../_internal/block-layout";
import type { GridAlign, GridColumns, GridElement, GridProps } from "./grid.types";

const DEFAULT_ELEMENT = "div";
const BREAKPOINTS: readonly LayoutBreakpoint[] = ["base", "sm", "md", "lg", "xl"];

const SPACE_TOKEN_MAP: Record<BlockSpace, string> = {
  "0": "0",
  xs: "var(--ak-space-xs)",
  sm: "var(--ak-space-sm)",
  md: "var(--ak-space-md)",
  lg: "var(--ak-space-lg)",
  xl: "var(--ak-space-xl)",
  "2xl": "var(--ak-space-2xl)",
  "3xl": "var(--ak-space-3xl)",
  page: "var(--ak-layout-page-gutter)",
};

function isResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
): value is Partial<Record<LayoutBreakpoint, T>> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      BREAKPOINTS.some((breakpoint) => breakpoint in value),
  );
}

function normalizeResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
): Partial<Record<LayoutBreakpoint, T>> | undefined {
  if (value === undefined) return undefined;
  if (isResponsiveValue(value)) return value;
  return { base: value };
}

function resolveColumns(value: GridColumns): string {
  if (typeof value === "number") {
    return `repeat(${value}, minmax(0, 1fr))`;
  }

  const trimmed = value.trim();
  return trimmed || "minmax(0, 1fr)";
}

function resolveGap(value: BlockSpace): string {
  return SPACE_TOKEN_MAP[value] ?? value;
}

function resolveAlign(value: GridAlign): string {
  if (value === "start") return "start";
  if (value === "end") return "end";
  return value;
}

function setResponsiveVar<T>(
  styles: Record<string, string | number>,
  property: string,
  value: ResponsiveValue<T> | undefined,
  resolve: (value: T) => string | number | undefined,
) {
  const normalized = normalizeResponsiveValue(value);
  if (!normalized) return;

  for (const breakpoint of BREAKPOINTS) {
    const breakpointValue = normalized[breakpoint];
    if (breakpointValue === undefined) continue;
    const resolved = resolve(breakpointValue);
    if (resolved === undefined || resolved === "") continue;
    styles[`--ak-grid-${property}-${breakpoint}`] = resolved;
  }
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
  setResponsiveVar(styles, "columns", columns, resolveColumns);
  setResponsiveVar(styles, "gap", gap, resolveGap);
  setResponsiveVar(styles, "align", align, resolveAlign);

  const generatedClass = styleDeclarationsToClass(mergeLayoutStyles(styles, userStyle));
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("grid", classProp, className, generatedClass),
    "data-slot": "grid",
  });

  const Element = (as ?? DEFAULT_ELEMENT) as keyof JSX.IntrinsicElements;
  return <Element {...finalProps}>{children}</Element>;
}
