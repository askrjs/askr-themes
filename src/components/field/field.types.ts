import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;
type ParagraphProps = Omit<JSX.IntrinsicElements["p"], "children" | "ref">;

/** Props for the {@link Field} component. */
export type FieldProps = DivProps & {
  children?: unknown;
  invalid?: boolean;
  ref?: Ref<HTMLDivElement>;
};

/** Props for the {@link FieldHint} component. */
export type FieldHintProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};

/** Props for the {@link FieldError} component. */
export type FieldErrorProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};
