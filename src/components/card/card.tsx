import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import type { CardProps, CardVariant } from "./card.types";

function normalizeVariant(variant: CardVariant | undefined) {
  return variant && variant !== "default" ? variant : undefined;
}

export function Card(props: CardProps): JSX.Element {
  const { children, class: className, variant, ref, ...rest } = props;
  const normalizedVariant = normalizeVariant(variant);

  const finalProps = mergeProps(rest, {
    ref,
    class: classes(
      "card",
      normalizedVariant && `card-${normalizedVariant}`,
      className,
    ),
    "data-slot": "card",
    "data-variant": normalizedVariant,
  });

  return <div {...finalProps}>{children}</div>;
}
