import { state } from "@askrjs/askr";
import { classes } from "../_internal/classes";
import { isJsxElement, toChildArray } from "../_internal/jsx";
import { mergeProps } from "../_internal/merge-props";
import { NavBrand } from "../navbar/navbar";
import {
  isShellPanelChild,
  renderKeyedShellChildren,
  renderKeyedShellPanelChildren,
  ShellPanelWatcher,
  ShellResponsiveWatcher,
} from "../shell/shell-responsive";
import { SidebarContext, SidebarResponsiveContext } from "./sidebar.context";
import { SidebarPanel } from "./sidebar-panel";
import { SidebarToggle } from "./sidebar-toggle";
import { isSidebarCollapsed, resolveSidebarCollapsible } from "./sidebar.shared";
import type { SidebarProps } from "./sidebar.types";
import type { CollapseIconPlacement } from "../shell/shell-nav.types";

type SidebarChildren = {
  brand?: unknown;
  drawerItems: unknown[];
  drawerSourceItems: unknown[];
  explicitPanelItems: unknown[];
  toggle?: SidebarToggleConfig;
};

type SidebarToggleConfig = {
  collapsedIcon?: unknown;
  expandedIcon?: unknown;
};

function isSidebarToggleChild(child: unknown): boolean {
  return isJsxElement(child) && child.type === SidebarToggle;
}

function splitSidebarChildren(children: unknown[]): SidebarChildren {
  const explicitPanelItems: unknown[] = [];
  const drawerSourceItems: unknown[] = [];
  let drawerItems: unknown[] | undefined;
  let brand: unknown;
  let hasBrand = false;
  let hasToggle = false;
  let toggle: SidebarToggleConfig | undefined;

  for (const child of children) {
    if (isShellPanelChild(child, SidebarPanel)) {
      explicitPanelItems.push(child);
      continue;
    }

    if (!hasToggle && isSidebarToggleChild(child)) {
      hasToggle = true;
      toggle = (child as { props?: SidebarToggleConfig } | undefined)?.props;
      continue;
    }

    drawerSourceItems.push(child);

    if (!hasBrand && isJsxElement(child) && child.type === NavBrand) {
      brand = child;
      hasBrand = true;
      drawerItems ??= drawerSourceItems.slice(0, drawerSourceItems.length - 1);
      continue;
    }

    drawerItems?.push(child);
  }

  return {
    brand: hasBrand ? brand : undefined,
    drawerItems: drawerItems ?? drawerSourceItems,
    drawerSourceItems,
    explicitPanelItems,
    toggle,
  };
}

function renderSidebarMenuContents(
  label: string,
  icon: unknown,
  iconPlacement: CollapseIconPlacement,
): JSX.Element {
  const renderedIcon = (
    <span class="sidebar-toggle-icon" data-slot="sidebar-toggle-icon" aria-hidden="true">
      {icon ?? (
        <span class="sidebar-toggle-glyph sidebar-toggle-glyph--menu">
          <span />
          <span />
          <span />
        </span>
      )}
    </span>
  );
  const renderedLabel = (
    <span class="sidebar-toggle-label" data-slot="sidebar-toggle-label">
      {label}
    </span>
  );

  if (iconPlacement === "end") {
    return (
      <>
        {renderedLabel}
        {renderedIcon}
      </>
    );
  }

  return (
    <>
      {renderedIcon}
      {renderedLabel}
    </>
  );
}

function renderSidebarRailContents(
  label: string,
  collapsed: boolean,
  toggle: SidebarToggleConfig | undefined,
): JSX.Element {
  const icon = collapsed ? toggle?.collapsedIcon : toggle?.expandedIcon;

  return (
    <>
      <span
        class="sidebar-rail-toggle-icon"
        data-slot="sidebar-rail-toggle-icon"
        aria-hidden="true"
      >
        {icon ?? (
          <span
            class={classes(
              "sidebar-toggle-glyph",
              "sidebar-toggle-glyph--rail",
              collapsed ? "is-collapsed" : "is-expanded",
            )}
          />
        )}
      </span>
      <span class="sidebar-rail-toggle-label" data-slot="sidebar-rail-toggle-label">
        {label}
      </span>
    </>
  );
}

export function Sidebar(props: SidebarProps): JSX.Element {
  const {
    children,
    collapsed: controlledCollapsed,
    breakpoint,
    collapseIcon,
    collapseIconPlacement = "start",
    collapseLabel,
    collapsible,
    defaultCollapsed = false,
    id,
    "aria-label": ariaLabel,
    onCollapsedChange,
    class: className,
    ref,
    ...rest
  } = props;
  const effectiveCollapseLabel =
    collapseLabel ?? (typeof ariaLabel === "string" ? ariaLabel : undefined) ?? "Menu";
  const childItems = toChildArray(children);
  const sidebarChildren = splitSidebarChildren(childItems);
  const isResponsive = breakpoint !== undefined;
  const responsiveCollapsedState = state(isResponsive ? isSidebarCollapsed(breakpoint) : false);
  const drawerOpenState = state(false);
  const panelId = typeof id === "string" ? `${id}-panel` : undefined;
  const collapseBehavior = resolveSidebarCollapsible(collapsible);
  const isRailCollapsible = collapseBehavior === "icon";
  const railCollapsedState = state(defaultCollapsed);
  const responsiveCollapsed = responsiveCollapsedState();
  const drawerOpen = drawerOpenState();
  const internalRailCollapsed = railCollapsedState();
  const isMobile = isResponsive ? responsiveCollapsed : false;
  const isDrawerOpen = isResponsive && isMobile && drawerOpen;
  const isRailCollapsed = isRailCollapsible
    ? (controlledCollapsed ?? internalRailCollapsed ?? false)
    : false;
  const closeDrawer = () => drawerOpenState.set(false);
  const closeDrawerOnNavActivation = (event: MouseEvent) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest('a[data-slot="nav-link"], a[data-slot="nav-item"], a.navbar-item')) {
      closeDrawer();
    }
  };
  const toggleDrawer = () => {
    drawerOpenState.set(!drawerOpenState());
  };
  const setRailCollapsed = (nextCollapsed: boolean) => {
    if (!isRailCollapsible) {
      return;
    }

    if (controlledCollapsed === undefined) {
      railCollapsedState.set(nextCollapsed);
    }

    onCollapsedChange?.(nextCollapsed);
  };
  const toggleRail = () => {
    if (!isRailCollapsible) {
      return;
    }

    setRailCollapsed(!isRailCollapsed);
  };
  const desktopChildren = renderKeyedShellChildren(
    sidebarChildren.drawerSourceItems,
    "sidebar-desktop",
  );
  const drawerChildren = renderKeyedShellChildren(sidebarChildren.drawerItems, "sidebar-drawer");

  const contextValue = {
    active: () => isResponsive,
    collapseLabel: () => effectiveCollapseLabel,
    closePanel: closeDrawer,
    iconCollapsed: () => isRailCollapsed,
    isRailCollapsible: () => isRailCollapsible,
    orientation: () => "vertical" as const,
    panelId: () => panelId,
    panelOpen: () => isDrawerOpen,
    togglePanel: toggleDrawer,
    toggleRail,
  };
  const panelContext = {
    active: isResponsive,
    collapseLabel: effectiveCollapseLabel,
    onClose: closeDrawer,
    open: isDrawerOpen,
    panelId,
  };
  const panels =
    sidebarChildren.explicitPanelItems.length > 0 ? (
      renderKeyedShellPanelChildren(
        sidebarChildren.explicitPanelItems,
        "sidebar-panel",
        panelContext,
      )
    ) : isResponsive ? (
      <SidebarPanel
        active={isResponsive}
        brand={sidebarChildren.brand}
        collapseLabel={effectiveCollapseLabel}
        onClose={closeDrawer}
        onClick={closeDrawerOnNavActivation}
        open={isDrawerOpen}
        panelId={panelId}
      >
        {drawerChildren}
      </SidebarPanel>
    ) : null;

  const finalProps = mergeProps(rest, {
    ref,
    "aria-label": ariaLabel,
    class: classes("sidebar", className),
    "data-collapse-below": breakpoint,
    "data-collapsible": collapseBehavior === "none" ? undefined : collapseBehavior,
    "data-icon-collapsed": isRailCollapsible ? (isRailCollapsed ? "true" : "false") : undefined,
    "data-mobile-open": isResponsive ? (drawerOpen ? "true" : "false") : undefined,
    "data-orientation": "vertical",
    "data-responsive-collapsed": isMobile ? "true" : "false",
    "data-slot": "sidebar",
  });

  return (
    <SidebarContext.Scope value={{ orientation: () => "vertical" as const }}>
      <SidebarResponsiveContext.Scope value={contextValue}>
        <nav {...finalProps}>
          {isResponsive ? (
            <div class="sidebar-mobile" data-slot="sidebar-mobile">
              <button
                aria-controls={panelId}
                aria-expanded={isDrawerOpen ? "true" : "false"}
                aria-label={effectiveCollapseLabel}
                class="sidebar-toggle"
                data-slot="sidebar-toggle"
                data-state={isDrawerOpen ? "open" : "closed"}
                data-variant="mobile"
                type="button"
                onClick={toggleDrawer}
              >
                {renderSidebarMenuContents(
                  effectiveCollapseLabel,
                  collapseIcon,
                  collapseIconPlacement,
                )}
              </button>
            </div>
          ) : null}

          <div class="sidebar-shell" data-orientation="vertical" data-slot="sidebar-shell">
            {isRailCollapsible && !isMobile ? (
              <div
                class="sidebar-rail"
                data-slot="sidebar-rail"
                data-state={isRailCollapsed ? "collapsed" : "expanded"}
              >
                <button
                  aria-expanded={isRailCollapsed ? "false" : "true"}
                  aria-label={
                    isRailCollapsed
                      ? `Expand ${effectiveCollapseLabel}`
                      : `Collapse ${effectiveCollapseLabel}`
                  }
                  class="sidebar-rail-toggle"
                  data-slot="sidebar-rail-toggle"
                  data-state={isRailCollapsed ? "collapsed" : "expanded"}
                  type="button"
                  onClick={toggleRail}
                >
                  {renderSidebarRailContents(
                    effectiveCollapseLabel,
                    isRailCollapsed,
                    sidebarChildren.toggle,
                  )}
                </button>
              </div>
            ) : null}
            {desktopChildren}
          </div>

          {panels}

          {isResponsive && isDrawerOpen ? (
            <button
              aria-label={`Close ${effectiveCollapseLabel}`}
              class="sidebar-backdrop"
              data-slot="sidebar-backdrop"
              data-state="open"
              tabIndex={-1}
              type="button"
              onClick={closeDrawer}
            />
          ) : null}

          {isResponsive ? (
            <ShellResponsiveWatcher
              breakpoint={breakpoint}
              isCollapsed={isSidebarCollapsed}
              onResize={(nextCollapsed) => {
                responsiveCollapsedState.set(nextCollapsed);
              }}
              onExpand={() => {
                drawerOpenState.set(false);
              }}
            />
          ) : null}

          <ShellPanelWatcher
            contentId={panelId}
            open={isDrawerOpen}
            panelSlot="sidebar-panel"
            onClose={() => {
              closeDrawer();
            }}
          />
        </nav>
      </SidebarResponsiveContext.Scope>
    </SidebarContext.Scope>
  );
}
