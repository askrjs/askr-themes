import type {
  NavBrandProps,
  NavGroupProps,
  NavbarProps,
} from "./navbar.types";

function classes(...values: Array<unknown>): string | undefined {
  const value = values.filter((item) => typeof item === "string" && item.trim()).join(" ");
  return value || undefined;
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