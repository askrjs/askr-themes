import { isCssLength, mergeLayoutStyles, serializeValueIf } from "../_internal/layout";
import type { SidebarLayoutProps } from "./sidebar-layout.types";

function isThemeGapToken(value: unknown): value is string {
  return typeof value === "string" && ["sm", "md", "lg", "xl"].includes(value.trim());
}

function isThemeSidebarWidthToken(value: unknown): value is string {
  return typeof value === "string" && ["sm", "md", "lg", "xl"].includes(value.trim());
}

export function SidebarLayout(props: SidebarLayoutProps): JSX.Element {
  const {
    sidebar,
    children,
    sidebarPosition = "start",
    sidebarWidth,
    gap,
    collapseBelow,
    ref,
    style: userStyle,
    ...rest
  } = props;

  const wrapperStyle: Record<string, string | number> = {};
  if (isCssLength(gap)) wrapperStyle.gap = gap!;

  const sidebarStyle: Record<string, string | number> = {};
  if (isCssLength(sidebarWidth)) {
    sidebarStyle.width = sidebarWidth!;
    sidebarStyle.flexBasis = sidebarWidth!;
  }

  return (
    <div
      {...rest}
      ref={ref}
      data-slot="sidebar-layout"
      data-sidebar-position={sidebarPosition}
      data-sidebar-width={serializeValueIf(sidebarWidth, isThemeSidebarWidthToken)}
      data-gap={serializeValueIf(gap, isThemeGapToken)}
      data-collapse-below={collapseBelow}
      style={mergeLayoutStyles(wrapperStyle, userStyle)}
    >
      {[
        <aside
          key="sidebar-layout-sidebar"
          data-slot="sidebar"
          style={mergeLayoutStyles(sidebarStyle, undefined)}
        >
          {sidebar}
        </aside>,
        <main key="sidebar-layout-main" data-slot="main">
          {children}
        </main>,
      ]}
    </div>
  );
}
