import type { JSXElement } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";

export type ShellVariant = "sidebar" | "topbar" | "rail";

export type ShellOwnProps = {
  variant?: ShellVariant;
  class?: string;
  children?: unknown;
};

export type ShellDivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref"> &
  ShellOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type ShellAsChildProps = Omit<ShellOwnProps, "as"> & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type ShellProps = ShellDivProps | ShellAsChildProps;

export type ShellNavOwnProps = {
  class?: string;
  children?: unknown;
};

export type ShellNavDivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref"> &
  ShellNavOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type ShellNavAsChildProps = Omit<ShellNavOwnProps, "as"> & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type ShellNavProps = ShellNavDivProps | ShellNavAsChildProps;

export type ShellMainOwnProps = {
  as?: "main" | "div";
  class?: string;
  children?: unknown;
};

export type ShellMainMainProps = Omit<JSX.IntrinsicElements["main"], "children" | "ref"> &
  ShellMainOwnProps & {
    as?: "main";
    asChild?: false;
    ref?: Ref<HTMLElement>;
  };

export type ShellMainDivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref"> &
  ShellMainOwnProps & {
    as: "div";
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type ShellMainAsChildProps = Omit<ShellMainOwnProps, "as"> & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

export type ShellMainProps = ShellMainMainProps | ShellMainDivProps | ShellMainAsChildProps;
