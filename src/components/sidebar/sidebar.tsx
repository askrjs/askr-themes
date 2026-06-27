import { Slot } from "@askrjs/askr/foundations";
import { Block } from "../block";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import type { SidebarButtonProps, SidebarPartProps, SidebarProps } from "./sidebar.types";

function sidebarPart(
  props: SidebarPartProps,
  slot: string,
  element: keyof JSX.IntrinsicElements = "div",
): JSX.Element {
  const { as, asChild, children, class: className, ...rest } = props;
  const Element = (as ?? element) as "div";
  const finalProps = mergeProps(rest, {
    class: className,
    "data-slot": slot,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return <Element {...finalProps}>{children}</Element>;
}

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

export function SidebarProvider(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-provider");
}

export function SidebarInset(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-inset", "main");
}

export function SidebarContent(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-content");
}

export function SidebarHeader(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-header");
}

export function SidebarFooter(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-footer");
}

export function SidebarGroup(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-group");
}

export function SidebarGroupLabel(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-group-label");
}

export function SidebarGroupContent(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-group-content");
}

export function SidebarMenu(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-menu", "ul");
}

export function SidebarMenuItem(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-menu-item", "li");
}

export function SidebarMenuButton(props: SidebarButtonProps): JSX.Element {
  const {
    active,
    asChild,
    children,
    class: className,
    size,
    type = "button",
    variant,
    ...rest
  } = props;
  const finalProps = mergeProps(rest, {
    class: classes(className),
    "data-active": active ? "true" : undefined,
    "data-size": size && size !== "default" ? size : undefined,
    "data-slot": "sidebar-menu-button",
    "data-variant": variant && variant !== "default" ? variant : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return (
    <button type={type} {...finalProps}>
      {children}
    </button>
  );
}

export function SidebarMenuAction(props: SidebarButtonProps): JSX.Element {
  const { children, class: className, type = "button", ...rest } = props;
  return (
    <button
      type={type}
      {...mergeProps(rest, {
        class: classes(className),
        "data-slot": "sidebar-menu-action",
      })}
    >
      {children}
    </button>
  );
}

export function SidebarMenuBadge(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-menu-badge", "span");
}

export function SidebarRail(props: SidebarPartProps): JSX.Element {
  return sidebarPart(props, "sidebar-rail", "button");
}

export function SidebarTrigger(props: SidebarButtonProps): JSX.Element {
  const { children, class: className, type = "button", ...rest } = props;
  return (
    <button
      type={type}
      {...mergeProps(rest, {
        class: classes("btn btn-ghost btn-icon", className),
        "data-slot": "sidebar-trigger",
      })}
    >
      {children}
    </button>
  );
}
