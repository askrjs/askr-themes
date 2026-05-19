import { Slot } from "@askrjs/askr/foundations";
import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import type { BadgeAsChildProps, BadgeProps } from "./badge.types";

function normalizeBadgeVariant(variant: BadgeProps["variant"] | undefined) {
  return variant && variant !== "default" ? `badge-${variant}` : undefined;
}

export function Badge(props: BadgeProps): JSX.Element;
export function Badge(props: BadgeAsChildProps): JSX.Element;
export function Badge(props: BadgeProps | BadgeAsChildProps) {
  const { asChild, children, variant, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    class: classes("badge", normalizeBadgeVariant(variant)),
    ref,
    "data-slot": "badge",
    "data-badge": "true",
    "data-variant": variant && variant !== "default" ? variant : undefined,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <span {...finalProps}>{children}</span>;
}
