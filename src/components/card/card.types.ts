import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/** Visual style of a {@link CardProps} card. */
export type CardVariant = "default" | "raised";
/** Heading tag allowed for a card's title via `titleAs`. */
export type CardTitleHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;
type HeadingProps = Omit<JSX.IntrinsicElements["h3"], "children" | "ref">;
type ParagraphProps = Omit<JSX.IntrinsicElements["p"], "children" | "ref">;

/** Props for the {@link Card} component. */
export type CardProps = DivProps & {
  children?: unknown;
  variant?: CardVariant;
  ref?: Ref<HTMLDivElement>;
};

/** Props for the {@link CardHeader} component. */
export type CardHeaderProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

/** Props for the {@link CardTitle} component. */
export type CardTitleProps = HeadingProps & {
  children?: unknown;
  /** Choose the level that follows the surrounding document hierarchy. */
  titleAs?: CardTitleHeadingTag;
  ref?: Ref<HTMLHeadingElement>;
};

/** Props for the {@link CardDescription} component. */
export type CardDescriptionProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};

/** Props for the {@link CardContent} component. */
export type CardContentProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

/** Props for the {@link CardFooter} component. */
export type CardFooterProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

/** Props for the {@link CardAction} component. */
export type CardActionProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};
