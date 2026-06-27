import { Slot } from "@askrjs/askr/foundations";
import { currentRoute, Link, navigate } from "@askrjs/askr/router";
import { Block } from "../block";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import { resolvePathname } from "../_internal/pathname";
import type {
  NavItemAsChildProps,
  NavItemProps,
  NavLinkProps,
  PillProps,
  PillsAsChildProps,
  PillsProps,
  TabProps,
  TabsAsChildProps,
  TabsProps,
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

function renderNavSet(
  props: TabsProps | TabsAsChildProps | PillsProps | PillsAsChildProps,
  slot: "tabs" | "pills",
): JSX.Element {
  const className = "class" in props ? props.class : undefined;
  const { asChild, children, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes(slot, className),
    "data-slot": slot,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return <nav {...finalProps}>{children}</nav>;
}

function renderRoutedLink(
  props: NavLinkProps | TabProps | PillProps,
  slot: "nav-item" | "tab" | "pill",
  options: { activeBackground?: boolean; className?: string; inheritSlot?: boolean } = {},
): JSX.Element {
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
  const inheritedSlot =
    options.inheritSlot && typeof (rest as Record<string, unknown>)["data-slot"] === "string"
      ? String((rest as Record<string, unknown>)["data-slot"])
      : undefined;
  const resolvedSlot = (inheritedSlot ?? slot) as "nav-item" | "tab" | "pill";
  const inheritedNavClass =
    slot === "nav-item" && resolvedSlot !== "nav-item" ? "nav-item" : undefined;
  const { "data-slot": _dataSlot, ...childRest } = rest as Record<string, unknown>;
  void _dataSlot;
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
  const useRouterLink = targetPathname !== null && !target && typeof onClick !== "function";
  const childProps = {
    ...childRest,
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
      radius={resolvedSlot === "pill" ? "round" : "md"}
      background={isActive && options.activeBackground ? "selected" : undefined}
      ref={ref}
      class={classes(options.className, inheritedNavClass, className)}
      data-slot={resolvedSlot}
      {...activeProps}
    >
      {useRouterLink ? (
        <Link {...childProps}>{children}</Link>
      ) : (
        <a {...childProps} onClick={handleClick}>
          {children}
        </a>
      )}
    </Block>
  );
}

export function Tabs(props: TabsProps): JSX.Element;
export function Tabs(props: TabsAsChildProps): JSX.Element;
export function Tabs(props: TabsProps | TabsAsChildProps): JSX.Element {
  return renderNavSet(props, "tabs");
}

export function Pills(props: PillsProps): JSX.Element;
export function Pills(props: PillsAsChildProps): JSX.Element;
export function Pills(props: PillsProps | PillsAsChildProps): JSX.Element {
  return renderNavSet(props, "pills");
}

export function Tab(props: TabProps): JSX.Element {
  return renderRoutedLink(props, "tab", { className: "tab" });
}

export function Pill(props: PillProps): JSX.Element {
  return renderRoutedLink(props, "pill", { activeBackground: true, className: "pill" });
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
  return renderRoutedLink(props, "nav-item", { activeBackground: true, inheritSlot: true });
}
