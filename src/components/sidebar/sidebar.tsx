import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Slot } from "@askrjs/askr/foundations";
import { Block } from "../block";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import { intrinsicElement, normalizeAriaProps } from "../_internal/jsx";
import type {
  SidebarButtonProps,
  SidebarPartProps,
  SidebarProps,
  SidebarTooltipSide,
} from "./sidebar.types";

function sidebarTooltipProps(
  tooltip: string | undefined,
  tooltipSide: SidebarTooltipSide | undefined,
): Record<string, string | undefined> {
  return {
    "data-tooltip": tooltip,
    "data-tooltip-side": tooltip ? tooltipSide : undefined,
  };
}

function sidebarPart(
  props: SidebarPartProps,
  slot: string,
  element: keyof JSX.IntrinsicElements = "div",
): JSX.Element {
  const { as, asChild, children, class: className, ...rest } = props;
  const finalProps = mergeProps(normalizeAriaProps(rest), {
    class: className,
    "data-slot": slot,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return intrinsicElement(String(as ?? element), finalProps, children);
}

/** Root `<aside>` sidebar layout with configurable width, side, collapse behavior, and visual variant, exposed as data attributes for CSS. */
export function Sidebar(props: SidebarProps): JSX.Element {
  const {
    children,
    collapsible = "offcanvas",
    side = "left",
    variant = "sidebar",
    width = "sidebar",
    shrink = false,
    ...rest
  } = props;

  return (
    <Block
      as="aside"
      width={width}
      shrink={shrink}
      minHeight="screen"
      padding="md"
      gap="lg"
      borderRight={true}
      {...rest}
      data-collapsible={collapsible}
      data-side={side}
      data-slot="sidebar"
      data-variant={variant}
    >
      {children}
    </Block>
  );
}

/** Scoping wrapper that establishes the sidebar's CSS/context boundary. */
export function SidebarScope(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-scope");
}

/** Renders the `<main>` content area beside the {@link Sidebar}. */
export function SidebarInset(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-inset", "main");
}

/** Renders the scrollable content region of a {@link Sidebar}. */
export function SidebarContent(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-content");
}

/** Renders the header region of a {@link Sidebar}. */
export function SidebarHeader(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-header");
}

/** Renders the footer region of a {@link Sidebar}. */
export function SidebarFooter(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-footer");
}

/** Groups related {@link SidebarMenu} items together. */
export function SidebarGroup(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-group");
}

/** Renders the label for a {@link SidebarGroup}. */
export function SidebarGroupLabel(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-group-label");
}

/** Renders the content region of a {@link SidebarGroup}. */
export function SidebarGroupContent(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-group-content");
}

/** Renders a `<ul>` list of {@link SidebarMenuItem}s. */
export function SidebarMenu(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-menu", "ul");
}

/** Renders a single `<li>` entry within a {@link SidebarMenu}. */
export function SidebarMenuItem(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-menu-item", "li");
}

/** Clickable menu button within a {@link SidebarMenuItem}; supports `active`/`size`/`variant` state and an optional tooltip. */
export function SidebarMenuButton(props: SidebarButtonProps): JSX.Element {
  const {
    active,
    asChild,
    children,
    class: className,
    size,
    tooltip,
    tooltipSide,
    type = "button",
    variant,
    ...rest
  } = props;
  const finalProps = mergeProps(normalizeAriaProps(rest), {
    class: classes(className),
    "data-active": active ? "true" : undefined,
    "data-size": size && size !== "default" ? size : undefined,
    "data-slot": "sidebar-menu-button",
    ...sidebarTooltipProps(tooltip, tooltipSide),
    "data-variant": variant && variant !== "default" ? variant : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return (
    <button type={type as "button" | "submit" | "reset" | undefined} {...finalProps}>
      {children}
    </button>
  );
}

/** Renders a secondary action button attached to a {@link SidebarMenuItem}, with an optional tooltip. */
export function SidebarMenuAction(props: SidebarButtonProps): JSX.Element {
  const {
    asChild,
    children,
    class: className,
    tooltip,
    tooltipSide,
    type = "button",
    ...rest
  } = props;
  const finalProps = mergeProps(normalizeAriaProps(rest), {
    class: classes(className),
    "data-slot": "sidebar-menu-action",
    ...sidebarTooltipProps(tooltip, tooltipSide),
  });
  if (asChild) return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  return (
    <button type={type as "button" | "submit" | "reset" | undefined} {...finalProps}>
      {children}
    </button>
  );
}

/** Renders a status badge attached to a {@link SidebarMenuItem}. */
export function SidebarMenuBadge(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-menu-badge", "span");
}

/** Renders a draggable/clickable rail along the sidebar's edge for resizing or toggling it. */
export function SidebarRail(props: SidebarButtonProps): JSX.Element {
  const { asChild, children, class: className, type = "button", ...rest } = props;
  const finalProps = mergeProps(normalizeAriaProps(rest), {
    class: classes(className),
    "data-slot": "sidebar-rail",
  });
  if (asChild) return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  return (
    <button type={type as "button" | "submit" | "reset" | undefined} {...finalProps}>
      {children}
    </button>
  );
}

/** Icon button that toggles the {@link Sidebar}'s open/collapsed state, with an optional tooltip. */
export function SidebarTrigger(props: SidebarButtonProps): JSX.Element {
  const {
    asChild,
    children,
    class: className,
    tooltip,
    tooltipSide,
    type = "button",
    ...rest
  } = props;
  const finalProps = mergeProps(normalizeAriaProps(rest), {
    class: classes("btn btn-ghost btn-icon", className),
    "data-slot": "sidebar-trigger",
    ...sidebarTooltipProps(tooltip, tooltipSide),
  });
  if (asChild) return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  return (
    <button type={type as "button" | "submit" | "reset" | undefined} {...finalProps}>
      {children}
    </button>
  );
}
