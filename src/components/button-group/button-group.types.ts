import type { Ref } from "@askrjs/askr/foundations/utilities";

export type ButtonGroupOrientation = "horizontal" | "vertical";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;

export type ButtonGroupProps = DivProps & {
  children?: unknown;
  attached?: boolean;
  orientation?: ButtonGroupOrientation;
  ref?: Ref<HTMLDivElement>;
};
