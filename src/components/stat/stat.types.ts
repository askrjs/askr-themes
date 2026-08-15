import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;
type ParagraphProps = Omit<JSX.IntrinsicElements["p"], "children" | "ref">;

/** Props for the {@link Stat} component. */
export type StatProps = DivProps & {
  children?: unknown;
  ref?: Ref<HTMLDivElement>;
};

/** Props for the {@link StatLabel} component. */
export type StatLabelProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};

/** Props for the {@link StatValue} component. */
export type StatValueProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};

/** Props for the {@link StatDescription} component. */
export type StatDescriptionProps = ParagraphProps & {
  children?: unknown;
  ref?: Ref<HTMLParagraphElement>;
};
