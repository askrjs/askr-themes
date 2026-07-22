import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import type {
  CardActionProps,
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
  CardVariant,
} from "./card.types";

function normalizeVariant(variant: CardVariant | undefined) {
  return variant && variant !== "default" ? variant : undefined;
}

export function Card(props: CardProps): JSX.Element {
  const { children, class: className, variant, ref, ...rest } = props;
  const normalizedVariant = normalizeVariant(variant);

  const finalProps = mergeProps(rest, {
    ref,
    class: classes("card", normalizedVariant && `card-${normalizedVariant}`, className),
    "data-slot": "card",
    "data-variant": normalizedVariant,
  });

  return <div {...finalProps}>{children}</div>;
}

export function CardHeader(props: CardHeaderProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("card-header", className),
    "data-slot": "card-header",
  });

  return <div {...finalProps}>{children}</div>;
}

export function CardTitle(props: CardTitleProps): JSX.Element {
  const { children, class: className, ref, titleAs: TitleTag = "h3", ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("card-title", className),
    "data-slot": "card-title",
  });

  return <TitleTag {...finalProps}>{children}</TitleTag>;
}

export function CardDescription(props: CardDescriptionProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("card-description", className),
    "data-slot": "card-description",
  });

  return <p {...finalProps}>{children}</p>;
}

export function CardContent(props: CardContentProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("card-content", className),
    "data-slot": "card-content",
  });

  return <div {...finalProps}>{children}</div>;
}

export function CardFooter(props: CardFooterProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("card-footer", className),
    "data-slot": "card-footer",
  });

  return <div {...finalProps}>{children}</div>;
}

export function CardAction(props: CardActionProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("card-action", className),
    "data-slot": "card-action",
  });

  return <div {...finalProps}>{children}</div>;
}
