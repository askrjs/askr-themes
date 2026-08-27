import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";
import type { TextFont, TextNumeric, TextTone, TextWeight, TextWrap } from "../text";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

type NativeHeadingProps = Omit<JSX.IntrinsicElements["h1"], "children" | "ref">;

/** Strongly typed semantic heading props with visual treatment independent from document level. */
export type HeadingProps = NativeHeadingProps & {
  level: HeadingLevel;
  size?: HeadingSize;
  tone?: TextTone;
  weight?: TextWeight;
  font?: TextFont;
  numeric?: TextNumeric;
  wrap?: TextWrap;
  truncate?: boolean;
  children?: unknown;
  ref?: Ref<HTMLHeadingElement>;
};
