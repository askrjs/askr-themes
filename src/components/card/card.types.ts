import type { Ref } from "@askrjs/askr/foundations";

export type CardVariant = "default" | "raised";
export type CardPadding = "sm" | "md" | "lg";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;
type HeadingProps = Omit<JSX.IntrinsicElements["h3"], "children" | "ref">;
type ParagraphProps = Omit<JSX.IntrinsicElements["p"], "children" | "ref">;

export type CardProps = DivProps & {
  children?: unknown;
  variant?: CardVariant;
  padding?: CardPadding;
  ref?: Ref<HTMLDivElement>;
};

export type CardHeaderProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

export type CardContentProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

export type CardFooterProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

export type CardTitleProps = HeadingProps & {
  children?: unknown;
  ref?: Ref<HTMLHeadingElement>;
};

export type CardDescriptionProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};
