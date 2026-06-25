import { serializeCssDeclarations } from "./style";

export type LayoutBreakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type ResponsiveValue<T> = T | Partial<Record<LayoutBreakpoint, T>>;

export type BlockSpace = "0" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "page";
export type BlockMargin = BlockSpace | "auto";
export type BlockSize = "auto" | "full" | "screen" | "content" | "sidebar" | "page" | "sm" | "md" | "lg" | "xl";
export type BlockDirection = "row" | "column" | "row-reverse" | "column-reverse";
export type BlockAlign = "start" | "end" | "center" | "stretch" | "baseline";
export type BlockJustify = "start" | "end" | "center" | "between";
export type BlockBackground =
  | "surface"
  | "muted"
  | "selected"
  | "canvas"
  | "raised"
  | "overlay"
  | "transparent";
export type BlockRadius = true | "sm" | "md" | "lg" | "xl" | "round";
export type BlockShadow = true | "sm" | "md" | "lg";
export type BlockZIndex =
  | "header"
  | "sticky"
  | "fixed"
  | "dropdown"
  | "modal"
  | "popover"
  | "toast"
  | "tooltip";

export type BlockLayoutProps = {
  padding?: ResponsiveValue<BlockSpace>;
  paddingX?: ResponsiveValue<BlockSpace>;
  paddingY?: ResponsiveValue<BlockSpace>;
  margin?: ResponsiveValue<BlockMargin>;
  marginX?: ResponsiveValue<BlockMargin>;
  marginY?: ResponsiveValue<BlockMargin>;
  width?: ResponsiveValue<BlockSize>;
  minWidth?: ResponsiveValue<BlockSize>;
  maxWidth?: ResponsiveValue<BlockSize>;
  height?: ResponsiveValue<BlockSize>;
  minHeight?: ResponsiveValue<BlockSize>;
  maxHeight?: ResponsiveValue<BlockSize>;
  direction?: ResponsiveValue<BlockDirection>;
  align?: ResponsiveValue<BlockAlign>;
  justify?: ResponsiveValue<BlockJustify>;
  gap?: ResponsiveValue<BlockSpace>;
  grow?: ResponsiveValue<boolean | number>;
  shrink?: ResponsiveValue<boolean | number>;
  center?: ResponsiveValue<boolean>;
  sticky?: boolean;
  top?: ResponsiveValue<BlockSpace>;
  zIndex?: ResponsiveValue<BlockZIndex>;
  background?: ResponsiveValue<BlockBackground>;
  border?: ResponsiveValue<boolean>;
  borderBottom?: ResponsiveValue<boolean>;
  borderRight?: ResponsiveValue<boolean>;
  radius?: ResponsiveValue<BlockRadius>;
  shadow?: ResponsiveValue<BlockShadow>;
  hide?: ResponsiveValue<boolean>;
};

const BREAKPOINTS: readonly LayoutBreakpoint[] = ["base", "sm", "md", "lg", "xl"];

const SPACE_TOKEN_MAP: Record<string, string> = {
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

const SIZE_TOKEN_MAP: Record<string, string> = {
  auto: "auto",
  full: "100%",
  screen: "100dvh",
  content: "min(60vh, 36rem)",
  sidebar: "var(--ak-layout-sidebar-width)",
  page: "var(--ak-layout-content-max-width)",
  sm: "var(--ak-container-1)",
  md: "var(--ak-container-2)",
  lg: "var(--ak-container-3)",
  xl: "var(--ak-container-4)",
};

const BACKGROUND_TOKEN_MAP: Record<string, string> = {
  canvas: "var(--ak-color-bg)",
  surface: "var(--ak-color-surface)",
  muted: "var(--ak-color-surface-muted)",
  raised: "var(--ak-color-surface-raised)",
  overlay: "var(--ak-color-surface-overlay)",
  selected: "var(--ak-color-selected)",
  transparent: "transparent",
};

const RADIUS_TOKEN_MAP: Record<string, string> = {
  sm: "var(--ak-radius-sm)",
  md: "var(--ak-radius-md)",
  lg: "var(--ak-radius-lg)",
  xl: "var(--ak-radius-xl)",
  round: "var(--ak-radius-round)",
};

const SHADOW_TOKEN_MAP: Record<string, string> = {
  sm: "var(--ak-shadow-sm)",
  md: "var(--ak-shadow-md)",
  lg: "var(--ak-shadow-lg)",
};

const Z_INDEX_TOKEN_MAP: Record<string, string> = {
  header: "var(--ak-z-sticky)",
  sticky: "var(--ak-z-sticky)",
  fixed: "var(--ak-z-fixed)",
  dropdown: "var(--ak-z-dropdown)",
  modal: "var(--ak-z-modal)",
  popover: "var(--ak-z-popover)",
  toast: "var(--ak-z-toast)",
  tooltip: "var(--ak-z-tooltip)",
};

const BORDER_VALUE = "1px solid var(--ak-color-border-subtle)";

const BLOCK_LAYOUT_KEYS = new Set<keyof BlockLayoutProps>([
  "padding",
  "paddingX",
  "paddingY",
  "margin",
  "marginX",
  "marginY",
  "width",
  "minWidth",
  "maxWidth",
  "height",
  "minHeight",
  "maxHeight",
  "direction",
  "align",
  "justify",
  "gap",
  "grow",
  "shrink",
  "center",
  "sticky",
  "top",
  "zIndex",
  "background",
  "border",
  "borderBottom",
  "borderRight",
  "radius",
  "shadow",
  "hide",
]);

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

function resolveTokenValue(value: string | number, tokens: Record<string, string>): string | number {
  if (typeof value === "number") return value;
  const trimmed = value.trim();
  return tokens[trimmed] ?? trimmed;
}

function resolveSpaceValue(value: string | number): string | number {
  return resolveTokenValue(value, SPACE_TOKEN_MAP);
}

function resolveSizeValue(value: string): string {
  return String(resolveTokenValue(value, SIZE_TOKEN_MAP));
}

function resolveAlignValue(value: BlockAlign): string {
  if (value === "start") return "flex-start";
  if (value === "end") return "flex-end";
  return value;
}

function resolveJustifyValue(value: BlockJustify): string {
  if (value === "start") return "flex-start";
  if (value === "end") return "flex-end";
  if (value === "between") return "space-between";
  return value;
}

function resolveFlexFlag(value: boolean | number): string | number {
  if (value === true) return 1;
  if (value === false) return 0;
  return value;
}

function resolveBorderValue(value: boolean): string | undefined {
  if (value === false) return "0";
  return BORDER_VALUE;
}

function resolveRadiusValue(value: BlockRadius): string | undefined {
  if (value === true) return RADIUS_TOKEN_MAP.md;
  return String(resolveTokenValue(value, RADIUS_TOKEN_MAP));
}

function resolveShadowValue(value: BlockShadow): string | undefined {
  if (value === true) return SHADOW_TOKEN_MAP.sm;
  return String(resolveTokenValue(value, SHADOW_TOKEN_MAP));
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
    styles[`--ak-${property}-${breakpoint}`] = resolved;
  }
}

export function splitBlockLayoutProps<T extends Record<string, unknown>>(
  props: T,
): {
  blockProps: Partial<BlockLayoutProps>;
  rest: Omit<T, keyof BlockLayoutProps>;
} {
  const blockProps: Partial<BlockLayoutProps> = {};
  const rest: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (BLOCK_LAYOUT_KEYS.has(key as keyof BlockLayoutProps)) {
      (blockProps as Record<string, unknown>)[key] = value;
    } else {
      rest[key] = value;
    }
  }

  return { blockProps, rest: rest as Omit<T, keyof BlockLayoutProps> };
}

export function applyBlockLayoutStyles(
  styles: Record<string, string | number>,
  props: Partial<BlockLayoutProps>,
) {
  setResponsiveVar(styles, "p", props.padding, resolveSpaceValue);
  setResponsiveVar(styles, "px", props.paddingX, resolveSpaceValue);
  setResponsiveVar(styles, "py", props.paddingY, resolveSpaceValue);
  setResponsiveVar(styles, "m", props.margin, resolveSpaceValue);
  setResponsiveVar(styles, "mx", props.marginX, resolveSpaceValue);
  setResponsiveVar(styles, "my", props.marginY, resolveSpaceValue);

  setResponsiveVar(styles, "width", props.width, resolveSizeValue);
  setResponsiveVar(styles, "min-width", props.minWidth, resolveSizeValue);
  setResponsiveVar(styles, "max-width", props.maxWidth, resolveSizeValue);
  setResponsiveVar(styles, "height", props.height, resolveSizeValue);
  setResponsiveVar(styles, "min-height", props.minHeight, resolveSizeValue);
  setResponsiveVar(styles, "max-height", props.maxHeight, resolveSizeValue);

  setResponsiveVar(styles, "flex-direction", props.direction, (value) => value);
  setResponsiveVar(styles, "align-items", props.align, resolveAlignValue);
  setResponsiveVar(styles, "justify-content", props.justify, resolveJustifyValue);
  setResponsiveVar(styles, "gap", props.gap, resolveSpaceValue);
  setResponsiveVar(styles, "flex-grow", props.grow, resolveFlexFlag);
  setResponsiveVar(styles, "flex-shrink", props.shrink, resolveFlexFlag);

  if (props.center !== undefined) {
    setResponsiveVar(styles, "align-items", props.center, (value) =>
      value ? "center" : undefined,
    );
    setResponsiveVar(styles, "justify-content", props.center, (value) =>
      value ? "center" : undefined,
    );
  }

  if (props.sticky) {
    styles["--ak-position-base"] = "sticky";
  }
  setResponsiveVar(styles, "top", props.top, resolveSpaceValue);
  setResponsiveVar(styles, "z-index", props.zIndex, (value) =>
    String(resolveTokenValue(value, Z_INDEX_TOKEN_MAP)),
  );

  setResponsiveVar(styles, "background", props.background, (value) =>
    String(resolveTokenValue(value, BACKGROUND_TOKEN_MAP)),
  );
  setResponsiveVar(styles, "border", props.border, resolveBorderValue);
  setResponsiveVar(styles, "border-bottom", props.borderBottom, resolveBorderValue);
  setResponsiveVar(styles, "border-right", props.borderRight, resolveBorderValue);
  setResponsiveVar(styles, "border-radius", props.radius, resolveRadiusValue);
  setResponsiveVar(styles, "box-shadow", props.shadow, resolveShadowValue);
  setResponsiveVar(styles, "display", props.hide, (value) => (value ? "none" : "flex"));
}

export function mergeLayoutStyles(
  layout: Record<string, string | number>,
  user: unknown,
): string | undefined {
  const merged: Record<string, unknown> = { ...layout };

  if (user !== null && user !== undefined && typeof user === "object") {
    Object.assign(merged, user as Record<string, unknown>);
  }

  const mergedString = serializeCssDeclarations(merged);

  if (typeof user === "string" && user.trim()) {
    return mergedString ? `${mergedString};${user.trim()}` : user.trim();
  }

  return mergedString || undefined;
}
