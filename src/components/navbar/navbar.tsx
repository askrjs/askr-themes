import { state } from "@askrjs/askr";
import { classes } from "../_internal/classes";
import { isJsxElement, toChildArray } from "../_internal/jsx";
import { mergeProps } from "../_internal/merge-props";
import {
  renderKeyedShellChildren,
  ShellPanelWatcher,
  ShellResponsiveWatcher,
} from "../shell/shell-responsive";
import { renderNavbarCollapseContents } from "./navbar.render";
import { NavbarPanel } from "./navbar-panel";
import { NavbarResponsiveContext } from "./navbar.context";
import { isNavbarCollapsed, resolveNavGroupAlign } from "./navbar.shared";
import type { NavBrandProps, NavGroupProps, NavToggleProps, NavbarProps } from "./navbar.types";

/**
 * Extracts the first NavBrand child to display in the mobile panel.
 * NavBrand should be the first child of Navbar for it to appear in the mobile menu.
 */
function findNavbarBrand(children: unknown): unknown {
  return toChildArray(children).find((child) => isJsxElement(child) && child.type === NavBrand);
}

function withoutNavbarBrand(children: unknown): unknown[] {
  return toChildArray(children).filter(
    (child) => !(isJsxElement(child) && child.type === NavBrand),
  );
}

/**
 * Responsive mobile-first navbar component.
 *
 * Composition: Navbar should contain NavBrand (extracted to mobile panel), NavGroup items with optional align,
 * and NavLink children. Brand must be first child to appear in mobile menu.
 *
 * @example
 * <Navbar breakpoint="md" aria-label="Main navigation">
 *   <NavBrand><a href="/">Logo</a></NavBrand>
 *   <NavGroup align="center">
 *     <NavLink href="/docs">Docs</NavLink>
 *   </NavGroup>
 *   <NavGroup align="end">
 *     <NavLink href="/settings">Settings</NavLink>
 *   </NavGroup>
 * </Navbar>
 */
export function Navbar(props: NavbarProps): JSX.Element {
  const {
    children,
    breakpoint,
    collapseIcon,
    collapseIconPlacement = "start",
    collapseLabel,
    ref,
    class: className,
    id,
    "aria-label": ariaLabel,
    ...rest
  } = props;
  const effectiveCollapseLabel = collapseLabel ?? "Menu";
  const responsiveChildren = toChildArray(children);
  const desktopChildren = renderKeyedShellChildren(responsiveChildren, "navbar-desktop");
  const panelChildren = renderKeyedShellChildren(
    withoutNavbarBrand(responsiveChildren),
    "navbar-panel",
  );
  // Extract brand to display in mobile panel header
  const responsiveCollapsedState =
    breakpoint !== undefined ? state(isNavbarCollapsed(breakpoint)) : undefined;
  const mobileMenuState = state(false);
  const mobileMenuOpen = mobileMenuState();
  const panelId = typeof id === "string" ? `${id}-panel` : undefined;
  const responsiveCollapsed = breakpoint !== undefined ? responsiveCollapsedState?.() : false;
  const panelOpen = Boolean(responsiveCollapsed && mobileMenuOpen);
  const closePanel = () => mobileMenuState.set(false);
  const closePanelOnNavActivation = (event: MouseEvent) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest('a[data-slot="nav-link"], a[data-slot="nav-item"], a.navbar-item')) {
      closePanel();
    }
  };
  const togglePanel = () => {
    mobileMenuState.set(!mobileMenuState());
  };
  const contextValue = {
    active: () => breakpoint !== undefined,
    collapseLabel: () => effectiveCollapseLabel,
    closePanel,
    panelId: () => panelId,
    panelOpen: () => Boolean(responsiveCollapsedState?.() && mobileMenuOpen),
    togglePanel,
  };
  const panelBrand = findNavbarBrand(responsiveChildren);
  const finalProps = mergeProps(rest, {
    "aria-label": ariaLabel,
    ref,
    class: classes("navbar", className),
    "data-collapse-below": breakpoint,
    "data-responsive-collapsed": responsiveCollapsed ? "true" : "false",
    "data-slot": "navbar",
  });

  return (
    <NavbarResponsiveContext.Scope value={contextValue}>
      <nav {...finalProps}>
        {breakpoint !== undefined ? (
          <div class="navbar-mobile" data-slot="navbar-mobile">
            <NavToggle
              active={breakpoint !== undefined}
              aria-controls={panelId}
              aria-label={effectiveCollapseLabel}
              icon={collapseIcon}
              iconPlacement={collapseIconPlacement}
              label={effectiveCollapseLabel}
              onToggle={togglePanel}
              open={panelOpen}
              panelId={panelId}
            />
          </div>
        ) : null}

        <div class="navbar-shell" data-slot="navbar-shell">
          {desktopChildren}
        </div>

        {breakpoint !== undefined ? (
          <NavbarPanel
            active={breakpoint !== undefined}
            brand={panelBrand}
            collapseLabel={effectiveCollapseLabel}
            onClose={closePanel}
            onClick={closePanelOnNavActivation}
            open={panelOpen}
            panelId={panelId}
          >
            {panelChildren}
          </NavbarPanel>
        ) : null}

        {responsiveCollapsed && mobileMenuOpen ? (
          <button
            aria-label={`Close ${effectiveCollapseLabel}`}
            class="navbar-backdrop"
            data-slot="navbar-backdrop"
            data-state="open"
            tabIndex={-1}
            type="button"
            onClick={closePanel}
          />
        ) : null}

        {breakpoint !== undefined ? (
          <ShellResponsiveWatcher
            breakpoint={breakpoint}
            isCollapsed={isNavbarCollapsed}
            onResize={(nextCollapsed) => {
              responsiveCollapsedState?.set(nextCollapsed);
            }}
            onExpand={() => {
              mobileMenuState?.set(false);
            }}
          />
        ) : null}

        <ShellPanelWatcher
          contentId={panelId}
          open={panelOpen}
          panelSlot="navbar-panel"
          onClose={closePanel}
        />
      </nav>
    </NavbarResponsiveContext.Scope>
  );
}

/**
 * Menu toggle button for responsive navbar collapse.
 * Auto-renders when navbar is responsive (collapseBelow set).
 */
export function NavToggle(props: NavToggleProps): JSX.Element | null {
  const {
    children,
    class: className,
    active,
    icon,
    iconPlacement = "start",
    label = "Menu",
    ref,
    onToggle,
    open,
    panelId,
    ...rest
  } = props;

  if (active === false) {
    return null;
  }

  const isOpen = open === true;

  const finalProps = mergeProps(rest, {
    ref,
    class: classes("navbar-toggle", className),
    "aria-controls": panelId,
    "aria-expanded": isOpen ? "true" : "false",
    "aria-label": label,
    "data-slot": "navbar-toggle",
    "data-state": isOpen ? "open" : "closed",
    type: "button",
    onClick: () => onToggle?.(),
  });

  return (
    <button {...finalProps}>
      {children ?? renderNavbarCollapseContents(label, icon, iconPlacement)}
    </button>
  );
}

/**
 * Brand/logo container displayed in navbar and mobile panel header.
 */
export function NavBrand(props: NavBrandProps): JSX.Element {
  const { children, ref, class: className, ...rest } = props;

  return (
    <div {...rest} ref={ref} class={classes("navbar-brand", className)} data-slot="navbar-brand">
      {children}
    </div>
  );
}

/**
 * Navigation group for organizing related nav items.
 *
 * @param align - Alignment: "start" (default), "center", or "end". Using align="end" automatically right-aligns the group.
 * @param label - Optional accessible label for grouped items.
 *
 * @example
 * <NavGroup align="center">
 *   <NavLink href="/docs">Docs</NavLink>
 * </NavGroup>
 */
export function NavGroup(props: NavGroupProps): JSX.Element {
  const { children, id, ref, class: className, label, ...rest } = props;
  const rawAlign = (rest as Record<string, unknown>)["data-align"];
  const align =
    props.align ??
    (rawAlign === "start" || rawAlign === "center" || rawAlign === "end"
      ? (rawAlign as NavGroupProps["align"])
      : undefined);
  const hasLabel = label !== undefined && label !== null;
  const labelId = hasLabel && id ? `${id}-label` : undefined;
  const accessibleLabel = typeof label === "string" ? label : undefined;

  return (
    <div
      {...rest}
      id={id}
      ref={ref}
      class={classes("navbar-group", className)}
      aria-label={labelId ? undefined : accessibleLabel}
      aria-labelledby={labelId}
      role={hasLabel ? "group" : rest.role}
      data-align={resolveNavGroupAlign(align)}
      data-has-label={hasLabel ? "true" : undefined}
      data-slot="navbar-group"
    >
      {hasLabel ? (
        <>
          <div id={labelId} class="navbar-group-label" data-slot="navbar-group-label">
            {label}
          </div>
          <div class="navbar-group-body" data-slot="navbar-group-body">
            {children}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}
