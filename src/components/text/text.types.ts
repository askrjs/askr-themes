import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/** Element tags {@link Text} can render as via its `as` prop. */
export type TextElement = "p" | "span" | "div" | "strong";
/** Font size modifier for {@link Text}. */
export type TextSize = "sm" | "md" | "lg";
/** Color tone modifier for {@link Text}. */
export type TextTone =
  | "default"
  | "muted"
  | "subtle"
  | "inverse"
  | "success"
  | "warning"
  | "danger"
  | "info";
/** Font weight modifier for {@link Text}. */
export type TextWeight = "normal" | "medium" | "semibold" | "bold";
/** Font family modifier for {@link Text}. */
export type TextFont = "body" | "mono";
/** Numeric glyph variant (e.g. tabular figures) for {@link Text}. */
export type TextNumeric = "normal" | "tabular";
/** White-space wrapping behavior for {@link Text}. */
export type TextWrap = "normal" | "nowrap" | "anywhere";

type TextIntrinsicProps<TElement extends TextElement> = Omit<
  JSX.IntrinsicElements[TElement],
  "children" | "ref"
>;

/** Props for the {@link Text} component, specialized for a given {@link TextElement} `TElement`. */
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
