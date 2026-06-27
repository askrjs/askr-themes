import { Dropdown, DropdownTrigger } from "@askrjs/ui";
import { Block } from "../block";
import { classes } from "../_internal/classes";
import { isJsxElement, toChildArray } from "../_internal/jsx";
import { DropdownContent } from "../overlays/dropdown-content";
import type { NavBrandProps, NavDropdownProps, NavGroupProps, NavbarProps } from "./navbar.types";

const ASKR_FRAGMENT = Symbol.for("askr.fragment");

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
      <Block
        as="nav"
        direction="row"
        align="center"
        gap="md"
        width="full"
        {...rest}
        data-slot="navbar"
      >
        {children}
      </Block>
    );
  }

  const navbarChildren = flattenNavbarChildren(children);
  const brandChildren = navbarChildren.filter(isNavBrandChild);
  const navChildren = navbarChildren.filter((child) => !isNavBrandChild(child));
  const hasNavContent = hasRenderableChildren(navChildren);
  const content = (
    <Block direction="row" align="center" gap="md" width="full" data-slot="navbar-content">
      {navChildren}
    </Block>
  );
  const collapse = hasNavContent ? (
    <details data-slot="navbar-collapse">
      <summary aria-label={collapseLabel} data-slot="navbar-toggle">
        {collapseIcon}
        <span data-slot="navbar-toggle-label">{collapseLabel}</span>
      </summary>
      {content}
    </details>
  ) : null;

  return (
    <Block
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
    </Block>
  );
}

export function NavBrand(props: NavBrandProps): JSX.Element {
  const { children, ...rest } = props;

  return (
    <Block direction="row" align="center" gap="sm" shrink={false} {...rest} data-slot="nav-brand">
      {children}
    </Block>
  );
}

export function NavGroup(props: NavGroupProps): JSX.Element {
  const { align, children, label, title = label, ...rest } = props;

  return (
    <Block align={align} gap="sm" {...rest} data-align={align} data-slot="nav-group">
      {title !== undefined ? <div data-slot="nav-group-label">{title}</div> : null}
      <Block gap="xs" data-slot="nav-group-body">
        {children}
      </Block>
    </Block>
  );
}

export function NavDropdown(props: NavDropdownProps): JSX.Element {
  const { align = "end", children, label, side = "bottom", sideOffset = 6, ...rest } = props;

  return (
    <Block direction="row" align="center" data-slot="nav-dropdown">
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
    </Block>
  );
}
