import type { Ref } from "@askrjs/askr/foundations/utilities";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;
type ParagraphProps = Omit<JSX.IntrinsicElements["p"], "children" | "ref">;

export type StatProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

export type StatLabelProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};

export type StatValueProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};

export type StatDescriptionProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};
