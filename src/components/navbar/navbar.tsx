import { Slot, mergeProps } from '@askrjs/ui/foundations';
import type {
  NavBrandProps,
  NavGroupProps,
  NavItemAsChildProps,
  NavItemProps,
  NavbarProps,
} from "./navbar.types";
import { classes } from '../_internal/classes';

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
  const {
    asChild,
    children,
    ref,
    class: className,
    variant = 'default',
    ...rest
  } = props;

  const finalProps = mergeProps(rest, {
    ref,
    class: classes('navbar-item', variant === 'icon' && 'navbar-item-icon', className),
    'data-slot': 'nav-item',
    'data-variant': variant,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <a {...finalProps}>
      {children}
    </a>
  );
}
