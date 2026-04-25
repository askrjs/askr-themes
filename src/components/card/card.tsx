import type {
  CardContentProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardPadding,
  CardProps,
  CardTitleProps,
  CardVariant,
} from "./card.types";

function normalizePadding(padding: CardPadding | undefined) {
  return padding && padding !== "md" ? padding : undefined;
}

function normalizeVariant(variant: CardVariant | undefined) {
  return variant && variant !== "default" ? variant : undefined;
}

export function Card(props: CardProps): JSX.Element {
  const { children, variant, padding = "md", ref, ...rest } = props;

  return (
    <div
      {...rest}
      ref={ref}
      data-slot="card"
      data-variant={normalizeVariant(variant)}
      data-padding={normalizePadding(padding)}
    >
      {children}
    </div>
  );
}

export function CardHeader(props: CardHeaderProps): JSX.Element {
  const { children, ref, ...rest } = props;
  return (
    <div {...rest} ref={ref} data-slot="card-header">
      {children}
    </div>
  );
}

export function CardTitle(props: CardTitleProps): JSX.Element {
  const { children, ref, ...rest } = props;
  return (
    <h3 {...rest} ref={ref} data-slot="card-title">
      {children}
    </h3>
  );
}

export function CardDescription(props: CardDescriptionProps): JSX.Element {
  const { children, ref, ...rest } = props;
  return (
    <p {...rest} ref={ref} data-slot="card-description">
      {children}
    </p>
  );
}

export function CardContent(props: CardContentProps): JSX.Element {
  const { children, ref, ...rest } = props;
  return (
    <div {...rest} ref={ref} data-slot="card-content">
      {children}
    </div>
  );
}

export function CardFooter(props: CardFooterProps): JSX.Element {
  const { children, ref, ...rest } = props;
  return (
    <div {...rest} ref={ref} data-slot="card-footer">
      {children}
    </div>
  );
}
