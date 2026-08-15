import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { BlockElementProps } from "../block";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/** Props for the {@link Footer} component. */
export type FooterProps = Omit<BlockElementProps<"footer">, "as">;

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;
type HeadingProps = Omit<JSX.IntrinsicElements["h2"], "children" | "ref">;
type ParagraphProps = Omit<JSX.IntrinsicElements["p"], "children" | "ref">;
type NavProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref">;
type AnchorProps = Omit<JSX.IntrinsicElements["a"], "children" | "ref">;

/** Props for the {@link FooterContent} component. */
export type FooterContentProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

/** Props for the {@link FooterSection} component. */
export type FooterSectionProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

/** Props for the {@link FooterTitle} component. */
export type FooterTitleProps = HeadingProps & {
  children?: unknown;
  ref?: Ref<HTMLHeadingElement>;
};

/** Props for the {@link FooterDescription} component. */
export type FooterDescriptionProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};

/** Props for the {@link FooterLinks} component. */
export type FooterLinksProps = NavProps & {
  children?: unknown;
  ref?: Ref<HTMLElement>;
};

/** Props for the {@link FooterLink} component. */
export type FooterLinkProps = AnchorProps & {
  children?: unknown;
  ref?: Ref<HTMLAnchorElement>;
};
