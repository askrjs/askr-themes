import { state } from "@askrjs/askr";
import { Dropdown, DropdownTrigger } from "@askrjs/ui";
import { Block } from "../block";
import { classes } from "../_internal/classes";
import { isJsxElement, toChildArray } from "../_internal/jsx";
import { DropdownContent } from "../overlays/dropdown-content";
import type { NavBrandProps, NavDropdownProps, NavGroupProps, NavbarProps } from "./navbar.types";

const ASKR_FRAGMENT = Symbol.for("askr.fragment");

type NavbarMenuProps = {
  children?: unknown;
  collapseIcon?: unknown;
  collapseLabel: string;
  menuAlign: NonNullable<NavbarProps["menuAlign"]>;
};

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
    isJsxElement(child) &&
    (child.type === NavBrand || child.props?.["data-slot"] === "nav-brand")
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
    children,
    collapseAt = false,
    collapseIcon,
    collapseLabel = "Menu",
    menuAlign = "end",
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
  const menuChildren = navbarChildren.filter((child) => !isNavBrandChild(child));
  const content = (
    <Block
      direction="row"
      align="center"
      gap="md"
      width="full"
      data-slot="navbar-content"
    >
      {menuChildren}
    </Block>
  );
  const menu = hasRenderableChildren(menuChildren) ? (
    <NavbarMenu
      collapseIcon={collapseIcon}
      collapseLabel={collapseLabel}
      menuAlign={menuAlign}
    >
      {menuChildren}
    </NavbarMenu>
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
      {[...brandChildren, content, menu]}
    </Block>
  );
}

function NavbarMenu(props: NavbarMenuProps): JSX.Element {
  const { children, collapseIcon, collapseLabel, menuAlign } = props;
  const menuOpen = state(false);

  const closeMenuOnLinkClick = (event: MouseEvent) => {
    const target = event.target;

    if (target instanceof Element && target.closest("a[href]")) {
      menuOpen.set(false);
    }
  };

  return (
    <Dropdown open={menuOpen()} onOpenChange={menuOpen.set}>
      <DropdownTrigger
        aria-label={collapseLabel}
        class={classes("nav-item")}
        data-slot="navbar-toggle"
      >
        {collapseIcon}
        <span data-slot="navbar-toggle-label">{collapseLabel}</span>
      </DropdownTrigger>
      <DropdownContent
        align={menuAlign}
        class={classes("dropdown-content")}
        data-slot="navbar-menu"
        side="bottom"
        sideOffset={6}
      >
        <Block gap="xs" onClick={closeMenuOnLinkClick} data-slot="navbar-menu-content">
          {children}
        </Block>
      </DropdownContent>
    </Dropdown>
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
  const { children, title, ...rest } = props;

  return (
    <Block gap="sm" {...rest} data-slot="nav-group">
      {title !== undefined ? (
        <div data-slot="nav-group-label">
          {title}
        </div>
      ) : null}
      <Block gap="xs" data-slot="nav-group-body">
        {children}
      </Block>
    </Block>
  );
}

export function NavDropdown(props: NavDropdownProps): JSX.Element {
  const {
    align = "end",
    children,
    label,
    side = "bottom",
    sideOffset = 6,
    ...rest
  } = props;

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
