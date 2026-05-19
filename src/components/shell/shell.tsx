import { Slot } from "@askrjs/askr/foundations";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import type {
  ShellAsChildProps,
  ShellDivProps,
  ShellMainAsChildProps,
  ShellMainDivProps,
  ShellMainMainProps,
  ShellNavAsChildProps,
  ShellNavDivProps,
} from "./shell.types";

export function Shell(props: ShellDivProps): JSX.Element;
export function Shell(props: ShellAsChildProps): JSX.Element;
export function Shell(props: ShellDivProps | ShellAsChildProps) {
  const { asChild, children, class: className, variant = "sidebar", ref, ...rest } = props;

  const finalProps = mergeProps(rest, {
    ref,
    class: classes("shell", className),
    "data-slot": "shell",
    "data-ak-layout": "true",
    "data-variant": variant,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function ShellNav(props: ShellNavDivProps): JSX.Element;
export function ShellNav(props: ShellNavAsChildProps): JSX.Element;
export function ShellNav(props: ShellNavDivProps | ShellNavAsChildProps) {
  const { asChild, children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("shell-nav", className),
    "data-slot": "shell-nav",
    "data-ak-layout": "true",
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function ShellMain(props: ShellMainMainProps): JSX.Element;
export function ShellMain(props: ShellMainDivProps): JSX.Element;
export function ShellMain(props: ShellMainAsChildProps): JSX.Element;
export function ShellMain(props: ShellMainMainProps | ShellMainDivProps | ShellMainAsChildProps) {
  const as = "as" in props ? props.as : "main";
  const { asChild, children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("shell-main", className),
    "data-slot": "shell-main",
    "data-ak-layout": "true",
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  if (as === "div") {
    return <div {...finalProps}>{children}</div>;
  }

  return <main {...finalProps}>{children}</main>;
}
