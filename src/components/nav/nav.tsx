import { Slot } from "@askrjs/askr/foundations";
import { currentRoute, Link, navigate } from "@askrjs/askr/router";
import { Block } from "../block";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import { resolvePathname } from "../_internal/pathname";
import type {
  NavAsChildProps,
  NavDivProps,
  NavItemAsChildProps,
  NavItemProps,
  NavLinkProps,
  NavListProps,
  NavNavProps,
  NavProps,
} from "./nav.types";

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
    active = false,
    children,
    ref,
    class: className,
    match: _match,
    ...rest
  } = props as (NavItemProps | NavItemAsChildProps) & { match?: unknown };
  void _match;

  if (asChild) {
    return (
      <Block
        asChild
        paddingX="sm"
        paddingY="xs"
        radius="md"
        background={active ? "selected" : undefined}
        {...rest}
        ref={ref}
        class={className}
        data-active={active ? "true" : undefined}
        data-slot="nav-item"
      >
        {children}
      </Block>
    );
  }

  return (
    <Block
      as="a"
      paddingX="sm"
      paddingY="xs"
      radius="md"
      background={active ? "selected" : undefined}
      {...rest}
      ref={ref}
      class={className}
      data-active={active ? "true" : undefined}
      data-slot="nav-item"
    >
      {children}
    </Block>
  );
}

export function NavLink(props: NavLinkProps): JSX.Element {
  const {
    active,
    children,
    href,
    onClick,
    ref,
    class: className,
    match = "prefix",
    target,
    ...rest
  } = props as NavLinkProps & { onClick?: (event: MouseEvent) => void };
  const currentPathname = getReactiveCurrentPathname();
  const targetPathname = resolvePathname(href);
  const routeActive =
    currentPathname !== null &&
    targetPathname !== null &&
    isActiveNavLink(currentPathname, targetPathname, match);
  const isActive = active ?? routeActive;
  const activeProps = isActive
    ? {
        "aria-current": "page" as const,
        "data-active": "true" as const,
      }
    : {
        "data-active": undefined,
      };
  const inheritedSlot =
    typeof (rest as Record<string, unknown>)["data-slot"] === "string"
      ? String((rest as Record<string, unknown>)["data-slot"])
      : undefined;
  const slot = inheritedSlot ?? "nav-item";
  const useRouterLink = targetPathname !== null && !target && typeof onClick !== "function";
  const childProps = {
    ...rest,
    href,
    target,
  };
  const handleClick = (event: MouseEvent) => {
    onClick?.(event);

    if (!shouldHandleClientNavigation(event, target, targetPathname)) {
      return;
    }

    event.preventDefault();
    navigate(href);
  };

  return (
    <Block
      asChild
      paddingX="sm"
      paddingY="xs"
      radius="md"
      background={isActive ? "selected" : undefined}
      ref={ref}
      class={slot === "nav-item" ? className : classes("nav-item", className)}
      data-slot={slot}
      {...activeProps}
    >
      {useRouterLink ? (
        <Link {...childProps}>
          {children}
        </Link>
      ) : (
        <a {...childProps} onClick={handleClick}>
          {children}
        </a>
      )}
    </Block>
  );
}
