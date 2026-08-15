import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/** Layout direction of a {@link ButtonGroup}. */
export type ButtonGroupOrientation = "horizontal" | "vertical";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;

/** Props for the {@link ButtonGroup} component. */
export type ButtonGroupProps = DivProps & {
  children?: unknown;
  attached?: boolean;
  orientation?: ButtonGroupOrientation;
  ref?: Ref<HTMLDivElement>;
};
