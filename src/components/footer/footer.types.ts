import type { BlockElementProps } from "../block";
import type { Ref } from "@askrjs/askr/foundations/utilities";

export type FooterProps = Omit<BlockElementProps<"footer">, "as">;

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;
type HeadingProps = Omit<JSX.IntrinsicElements["h2"], "children" | "ref">;
type ParagraphProps = Omit<JSX.IntrinsicElements["p"], "children" | "ref">;
type NavProps = Omit<JSX.IntrinsicElements["nav"], "children" | "ref">;
type AnchorProps = Omit<JSX.IntrinsicElements["a"], "children" | "ref">;

export type FooterContentProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

export type FooterSectionProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

export type FooterTitleProps = HeadingProps & {
  children?: unknown;
  ref?: Ref<HTMLHeadingElement>;
};

export type FooterDescriptionProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};

export type FooterLinksProps = NavProps & {
  children?: unknown;
  ref?: Ref<HTMLElement>;
};

export type FooterLinkProps = AnchorProps & {
  children?: unknown;
  ref?: Ref<HTMLAnchorElement>;
};
