import type { Ref } from "@askrjs/askr/foundations/utilities";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;
type ParagraphProps = Omit<JSX.IntrinsicElements["p"], "children" | "ref">;

export type FieldProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

export type FieldHintProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};

export type FieldErrorProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};
