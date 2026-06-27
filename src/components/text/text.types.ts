import type { Ref } from "@askrjs/askr/foundations/utilities";

export type TextElement = "p" | "span" | "div" | "strong";
export type TextSize = "sm" | "md" | "lg";
export type TextTone = "default" | "muted" | "subtle" | "inverse";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";

type TextIntrinsicProps<TElement extends TextElement> = Omit<
  JSX.IntrinsicElements[TElement],
  "children" | "ref"
>;

export type TextProps<TElement extends TextElement = "p"> = TextIntrinsicProps<TElement> & {
  as?: TElement;
  size?: TextSize;
  tone?: TextTone;
  weight?: TextWeight;
  children?: unknown;
  ref?: Ref<HTMLElement>;
};
