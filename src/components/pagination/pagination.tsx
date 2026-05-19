import { navigate } from "@askrjs/askr/router";
import { Slot } from "@askrjs/askr/foundations";
import { mergeProps } from "@askrjs/askr/foundations/utilities";
import { classes } from "../_internal/classes";
import { resolvePathname } from "../_internal/pathname";
import type {
  PaginationEllipsisProps,
  PaginationItemAsChildProps,
  PaginationItemProps,
  PaginationLinkProps,
  PaginationProps,
} from "./pagination.types";

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

export function Pagination(props: PaginationProps): JSX.Element {
  const { children, class: className, label = "Pagination", ref, ...rest } = props;

  return (
    <nav
      {...rest}
      ref={ref}
      class={classes("pagination", className)}
      aria-label={label}
      data-slot="pagination"
    >
      <ul class="pagination-list" data-slot="pagination-list">
        {children}
      </ul>
    </nav>
  );
}

export function PaginationItem(props: PaginationItemProps): JSX.Element;
export function PaginationItem(props: PaginationItemAsChildProps): JSX.Element;
export function PaginationItem(
  props: PaginationItemProps | PaginationItemAsChildProps,
): JSX.Element {
  const {
    active = false,
    asChild,
    children,
    disabled = false,
    ref,
    class: className,
    ...rest
  } = props;
  const finalProps = mergeProps(rest, {
    class: classes(
      "page-item",
      active ? "active" : undefined,
      disabled ? "disabled" : undefined,
      className,
    ),
    ref,
    "aria-current": active ? "page" : undefined,
    "aria-disabled": disabled ? "true" : undefined,
    "data-active": active ? "true" : undefined,
    "data-disabled": disabled ? "true" : undefined,
    "data-slot": "pagination-item",
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <li {...finalProps}>{children}</li>;
}

export function PaginationLink(props: PaginationLinkProps): JSX.Element {
  const {
    active = false,
    children,
    class: className,
    disabled = false,
    href,
    onClick,
    ref,
    target,
    ...rest
  } = props as PaginationLinkProps & { onClick?: (event: MouseEvent) => void };
  const hrefValue = href as string;
  const targetValue = target as string | undefined;
  const targetPathname = resolvePathname(hrefValue);
  const isActive = active;

  const linkProps = mergeProps(rest, {
    href,
    target: targetValue,
    ref,
    class: classes(
      "page-link",
      active ? "active" : undefined,
      disabled ? "disabled" : undefined,
      className,
    ),
    "aria-current": isActive ? "page" : undefined,
    "aria-disabled": disabled ? "true" : undefined,
    "data-active": isActive ? "true" : undefined,
    "data-disabled": disabled ? "true" : undefined,
    "data-slot": "pagination-link",
    tabIndex: disabled ? -1 : undefined,
  });

  const handleClick = (event: MouseEvent) => {
    onClick?.(event);

    if (disabled || !shouldHandleClientNavigation(event, targetValue, targetPathname)) {
      if (disabled) {
        event.preventDefault();
      }

      return;
    }

    event.preventDefault();
    navigate(hrefValue);
  };

  return (
    <a {...linkProps} onClick={handleClick}>
      {children}
    </a>
  );
}

export function PaginationEllipsis(props: PaginationEllipsisProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;

  return (
    <span
      {...rest}
      ref={ref}
      class={classes("pagination-ellipsis", className)}
      aria-hidden="true"
      data-slot="pagination-ellipsis"
    >
      {children ?? "..."}
    </span>
  );
}
