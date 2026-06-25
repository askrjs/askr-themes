import type { Ref } from "@askrjs/askr/foundations/utilities";

export type CardVariant = "default" | "raised";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;

export type CardProps = DivProps & {
  children?: unknown;
  variant?: CardVariant;
  ref?: Ref<HTMLDivElement>;
};
