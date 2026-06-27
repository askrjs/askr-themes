import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import type { StatDescriptionProps, StatLabelProps, StatProps, StatValueProps } from "./stat.types";

export function Stat(props: StatProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("stat", className),
    "data-slot": "stat",
  });

  return <div {...finalProps}>{children}</div>;
}

export function StatLabel(props: StatLabelProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("stat-label", className),
    "data-slot": "stat-label",
  });

  return <p {...finalProps}>{children}</p>;
}

export function StatValue(props: StatValueProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("stat-value", className),
    "data-slot": "stat-value",
  });

  return <p {...finalProps}>{children}</p>;
}

export function StatDescription(props: StatDescriptionProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("stat-description", className),
    "data-slot": "stat-description",
  });

  return <p {...finalProps}>{children}</p>;
}
