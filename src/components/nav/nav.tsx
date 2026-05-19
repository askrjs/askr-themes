import { Slot } from "@askrjs/askr/foundations";
import { currentRoute, navigate } from "@askrjs/askr/router";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import type {
  NavAsChildProps,
  NavDivProps,
  NavItemAsChildProps,
  NavItemProps,
  NavItemVariant,
  NavLinkProps,
  NavListProps,
  NavNavProps,
  NavProps,
} from "./nav.types";

function navItemClasses(variant: NavItemVariant, className: unknown): string | undefined {
  return classes(
    "nav-item",
    "navbar-item",
    variant === "icon" && "nav-item-icon",
    variant === "icon" && "navbar-item-icon",
    className,
  );
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

function getReactiveCurrentPathname(): string | null {
  try {
    return normalizePathname(currentRoute().path || "/");
  } catch {
    return getCurrentPathname();
  }
}

function resolveNavLinkPathname(href: string): string | null {
  const baseHref = typeof window !== "undefined" ? window.location.href : "http://localhost/";
  const baseOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost";

  try {
    const target = new URL(href, baseHref);
    if (target.origin !== baseOrigin) {
      return null;
    }

    if (
      typeof window !== "undefined" &&
      target.hash &&
      target.pathname === window.location.pathname &&
      target.search === window.location.search
    ) {
      return null;
    }

    return normalizePathname(target.pathname);
  } catch {
    return null;
  }
}

function shouldHandleClientNavigation(
  event: MouseEvent,
  target: string | undefined,
  targetPathname: string | null,
): boolean {
  if (targetPathname === null || target) {
    return false;
  }

  return (
    !event.defaultPrevented &&
    (event.button ?? 0) === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

function isActiveNavLink(
  currentPathname: string,
  targetPathname: string,
  match: NavLinkProps["match"] = "prefix",
): boolean {
  if (targetPathname === "/") {
    return currentPathname === "/";
  }

  if (match === "exact") {
    return currentPathname === targetPathname;
  }

  return currentPathname === targetPathname || currentPathname.startsWith(`${targetPathname}/`);
}

export function Nav(props: NavNavProps): JSX.Element;
export function Nav(props: NavDivProps): JSX.Element;
export function Nav(props: NavListProps): JSX.Element;
export function Nav(props: NavAsChildProps): JSX.Element;
export function Nav(props: NavProps): JSX.Element {
  const as = "as" in props ? props.as : "nav";
  const className = "class" in props ? props.class : undefined;
  const {
    asChild,
    children,
    orientation = "horizontal",
    variant = "default",
    ref,
    ...rest
  } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("nav", className),
    "data-slot": "nav",
    "data-orientation": orientation,
    "data-variant": variant,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  if (as === "div") {
    return <div {...finalProps}>{children}</div>;
  }

  if (as === "ul") {
    return <ul {...finalProps}>{children}</ul>;
  }

  return <nav {...finalProps}>{children}</nav>;
}

export function NavItem(props: NavItemProps): JSX.Element;
export function NavItem(props: NavItemAsChildProps): JSX.Element;
export function NavItem(props: NavItemProps | NavItemAsChildProps): JSX.Element {
  const {
    asChild,
    children,
    ref,
    class: className,
    match: _match,
    variant = "default",
    ...rest
  } = props as (NavItemProps | NavItemAsChildProps) & { match?: unknown };
  void _match;

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
  const {
    children,
    href,
    onClick,
    ref,
    class: className,
    match = "prefix",
    target,
    variant = "default",
    ...rest
  } = props as NavLinkProps & { onClick?: (event: MouseEvent) => void };
  const currentPathname = getReactiveCurrentPathname();
  const targetPathname = resolveNavLinkPathname(href);
  const isActive =
    currentPathname !== null &&
    targetPathname !== null &&
    isActiveNavLink(currentPathname, targetPathname, match);

  const linkProps = mergeProps(rest, {
    href,
    target,
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

  const handleClick = (event: MouseEvent) => {
    onClick?.(event);

    if (!shouldHandleClientNavigation(event, target, targetPathname)) {
      return;
    }

    event.preventDefault();
    navigate(href);
  };

  return (
    <a {...finalProps} onClick={handleClick}>
      {children}
    </a>
  );
}
