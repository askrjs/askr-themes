import { Link } from "@askrjs/askr/router";
import { Slot } from "@askrjs/askr/foundations";
import { mergeProps } from "../_internal/merge-props";
import type {
  NavBrandProps,
  NavGroupProps,
  NavItemAsChildProps,
  NavItemProps,
  NavItemVariant,
  NavLinkProps,
  NavbarProps,
} from "./navbar.types";
import { classes } from "../_internal/classes";

function navItemClasses(variant: NavItemVariant, className: unknown): string | undefined {
  return classes("navbar-item", variant === "icon" && "navbar-item-icon", className);
}

function normalizePathname(pathname: string): string {
  return pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
}

function getCurrentPathname(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return normalizePathname(window.location.pathname || "/");
}

function resolveNavLinkPathname(href: string): string | null {
  const baseHref = typeof window !== "undefined" ? window.location.href : "http://localhost/";
  const baseOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost";

  try {
    const target = new URL(href, baseHref);
    if (target.origin !== baseOrigin) {
      return null;
    }

    return normalizePathname(target.pathname);
  } catch {
    return null;
  }
}

function isActiveNavLink(currentPathname: string, targetPathname: string): boolean {
  if (targetPathname === "/") {
    return currentPathname === "/";
  }

  return currentPathname === targetPathname || currentPathname.startsWith(`${targetPathname}/`);
}

export function Navbar(props: NavbarProps): JSX.Element {
  const { children, ref, class: className, ...rest } = props;

  return (
    <nav {...rest} ref={ref} class={classes("navbar", className)} data-slot="navbar">
      {children}
    </nav>
  );
}

export function NavBrand(props: NavBrandProps): JSX.Element {
  const { children, ref, class: className, ...rest } = props;

  return (
    <div {...rest} ref={ref} class={classes("navbar-brand", className)} data-slot="navbar-brand">
      {children}
    </div>
  );
}

export function NavGroup(props: NavGroupProps): JSX.Element {
  const { children, ref, class: className, ...rest } = props;

  return (
    <div {...rest} ref={ref} class={classes("navbar-group", className)} data-slot="navbar-group">
      {children}
    </div>
  );
}

export function NavItem(props: NavItemProps): JSX.Element;
export function NavItem(props: NavItemAsChildProps): JSX.Element;
export function NavItem(props: NavItemProps | NavItemAsChildProps): JSX.Element {
  const { asChild, children, ref, class: className, variant = "default", ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    class: navItemClasses(variant, className),
    "data-slot": "nav-item",
    "data-variant": variant,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <a {...finalProps}>{children}</a>;
}

export function NavLink(props: NavLinkProps): JSX.Element {
  const { children, href, ref, class: className, variant = "default", ...rest } = props;
  const currentPathname = getCurrentPathname();
  const targetPathname = resolveNavLinkPathname(href);
  const isActive =
    currentPathname !== null &&
    targetPathname !== null &&
    isActiveNavLink(currentPathname, targetPathname);

  const linkProps = mergeProps(rest, {
    ref,
    class: navItemClasses(variant, className),
    "data-slot": "nav-link",
    "data-variant": variant,
  });

  const finalProps = isActive
    ? mergeProps(
        {
          "aria-current": "page",
          "data-active": "true",
        },
        linkProps,
      )
    : linkProps;

  return (
    <Link href={href} {...finalProps}>
      {children}
    </Link>
  );
}
