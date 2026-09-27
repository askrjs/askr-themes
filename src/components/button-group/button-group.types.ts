import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";

/**
 * Layout direction of a {@link ButtonGroup}. When omitted, an attached group is a row that
 * stacks at phone width unless it contains icon buttons. An explicit value keeps that direction
 * unless the caller also passes `data-responsive="true"`, which opts back into phone stacking.
 */
export type ButtonGroupOrientation = "horizontal" | "vertical";

type DivProps = Omit<JSX.IntrinsicElements["div"], "children" | "ref">;

/** Props for the {@link ButtonGroup} component. */
export type ButtonGroupProps = DivProps & {
  children?: unknown;
  attached?: boolean;
  orientation?: ButtonGroupOrientation;
  ref?: Ref<HTMLDivElement>;
};
