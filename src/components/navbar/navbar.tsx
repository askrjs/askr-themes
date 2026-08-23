import type { JSX } from "@askrjs/askr/jsx-runtime";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dropdown,
  DropdownTrigger,
} from "@askrjs/ui";
import { Block } from "../block";
import { classes } from "../_internal/classes";
import { isJsxElement, toChildArray } from "../_internal/jsx";
import { DropdownContent } from "../overlays/dropdown-content";
import type { NavBrandProps, NavDropdownProps, NavGroupProps, NavbarProps } from "./navbar.types";

const ASKR_FRAGMENT = Symbol.for("askr.fragment");
const LayoutBlock = Block as (props: Record<string, unknown>) => JSX.Element;

function flattenNavbarChildren(children: unknown): unknown[] {
  return toChildArray(children).flatMap((child) => {
    if (isJsxElement(child) && child.type === ASKR_FRAGMENT) {
      return flattenNavbarChildren(child.props?.children);
    }

    return [child];
  });
}

function isNavBrandChild(child: unknown): boolean {
  return (
    isJsxElement(child) && (child.type === NavBrand || child.props?.["data-slot"] === "nav-brand")
  );
}

function hasRenderableChildren(children: readonly unknown[]): boolean {
  return children.some((child) => {
    if (Array.isArray(child)) {
      return hasRenderableChildren(child);
    }

    return child !== undefined && child !== null && typeof child !== "boolean";
  });
}

/**
 * Horizontal navigation bar. Below `collapseAt`/`breakpoint`, non-brand
 * children are grouped behind a collapsible toggle so brand content stays
 * visible while the rest collapses on small screens.
 */
export function Navbar(props: NavbarProps): JSX.Element {
  const {
    breakpoint,
    children,
    collapseAt = breakpoint ?? false,
    collapseIcon,
    collapseLabel = "Menu",
    ...rest
  } = props;

  if (!collapseAt) {
    return (
      <LayoutBlock
        as="nav"
        direction="row"
        align="center"
        gap="md"
        width="full"
        {...rest}
        data-slot="navbar"
      >
        {children}
      </LayoutBlock>
    );
  }

  const navbarChildren = flattenNavbarChildren(children);
  const brandChildren = navbarChildren.filter(isNavBrandChild);
  const navChildren = navbarChildren.filter((child) => !isNavBrandChild(child));
  const hasNavContent = hasRenderableChildren(navChildren);
  const content = (
    <LayoutBlock direction="row" align="center" gap="md" width="full" data-slot="navbar-content">
      {navChildren}
    </LayoutBlock>
  );
  const collapse = hasNavContent ? (
    <div data-slot="navbar-collapse">
      <Collapsible>
        <CollapsibleTrigger aria-label={collapseLabel} data-slot="navbar-toggle">
          {collapseIcon}
          <span data-slot="navbar-toggle-label">{collapseLabel}</span>
        </CollapsibleTrigger>
        <CollapsibleContent forceMount asChild data-slot="navbar-content">
          {content}
        </CollapsibleContent>
      </Collapsible>
    </div>
  ) : null;

  return (
    <LayoutBlock
      as="nav"
      direction="row"
      align="center"
      gap="md"
      width="full"
      {...rest}
      data-collapse-at={collapseAt}
      data-slot="navbar"
    >
      {[...brandChildren, collapse]}
    </LayoutBlock>
  );
}

/** Renders the brand/logo slot of a {@link Navbar}; excluded from the collapsible section. */
export function NavBrand(props: NavBrandProps): JSX.Element {
  const { children, ...rest } = props;

  return (
    <LayoutBlock
      direction="row"
      align="center"
      gap="sm"
      shrink={false}
      {...rest}
      data-slot="nav-brand"
    >
      {children}
    </LayoutBlock>
  );
}

/** Groups related {@link Navbar} items under an optional label. */
export function NavGroup(props: NavGroupProps): JSX.Element {
  const { align, children, label, title = label, ...rest } = props;

  return (
    <LayoutBlock
      direction="column"
      align={align}
      gap="sm"
      {...rest}
      data-align={align}
      data-slot="nav-group"
    >
      {title !== undefined ? <div data-slot="nav-group-label">{title}</div> : null}
      <LayoutBlock direction="column" gap="xs" data-slot="nav-group-body">
        {children}
      </LayoutBlock>
    </LayoutBlock>
  );
}

/** Renders a dropdown menu triggered from within a {@link Navbar}. */
export function NavDropdown(props: NavDropdownProps): JSX.Element {
  const { align = "end", children, label, side = "bottom", sideOffset = 6, ...rest } = props;

  return (
    <LayoutBlock direction="row" align="center" data-slot="nav-dropdown">
      <Dropdown {...rest}>
        <DropdownTrigger class={classes("nav-item")} data-slot="nav-dropdown-trigger">
          {label}
        </DropdownTrigger>
        <DropdownContent
          align={align}
          class={classes("dropdown-content")}
          data-slot="nav-dropdown-content"
          side={side}
          sideOffset={sideOffset}
        >
          {children}
        </DropdownContent>
      </Dropdown>
    </LayoutBlock>
  );
}
