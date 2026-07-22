import type { Ref } from "@askrjs/askr/foundations/utilities";

export type CardVariant = "default" | "raised";
export type CardTitleHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;
type HeadingProps = Omit<JSX.IntrinsicElements["h3"], "children" | "ref">;
type ParagraphProps = Omit<JSX.IntrinsicElements["p"], "children" | "ref">;

export type CardProps = DivProps & {
  children?: unknown;
  variant?: CardVariant;
  ref?: Ref<HTMLDivElement>;
};

export type CardHeaderProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

export type CardTitleProps = HeadingProps & {
  children?: unknown;
  /** Choose the level that follows the surrounding document hierarchy. */
  titleAs?: CardTitleHeadingTag;
  ref?: Ref<HTMLHeadingElement>;
};

export type CardDescriptionProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};

export type CardContentProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

export type CardFooterProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

export type CardActionProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};
