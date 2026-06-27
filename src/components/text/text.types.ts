import type { Ref } from "@askrjs/askr/foundations/utilities";

export type TextElement = "p" | "span" | "div" | "strong";
export type TextSize = "sm" | "md" | "lg";
export type TextTone =
  | "default"
  | "muted"
  | "subtle"
  | "inverse"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";
export type TextFont = "body" | "mono";
export type TextNumeric = "normal" | "tabular";
export type TextWrap = "normal" | "nowrap" | "anywhere";

type TextIntrinsicProps<TElement extends TextElement> = Omit<
  JSX.IntrinsicElements[TElement],
  "children" | "ref"
>;

export type TextProps<TElement extends TextElement = "p"> = TextIntrinsicProps<TElement> & {
  as?: TElement;
  size?: TextSize;
  tone?: TextTone;
  weight?: TextWeight;
  font?: TextFont;
  numeric?: TextNumeric;
  wrap?: TextWrap;
  truncate?: boolean;
  children?: unknown;
  ref?: Ref<HTMLElement>;
};
