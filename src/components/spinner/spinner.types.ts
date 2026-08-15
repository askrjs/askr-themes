import type { ProgressCircleProps } from "@askrjs/ui";

/** Size modifier for {@link Spinner}. */
export type SpinnerSize = "sm" | "md" | "lg";

/** Props specific to {@link Spinner}, layered on top of `ProgressCircleProps`. */
export type SpinnerOwnProps = Omit<ProgressCircleProps, "value" | "getValueLabel"> & {
  label?: string;
  size?: SpinnerSize;
};

/** Props for the {@link Spinner} component. */
export type SpinnerProps = SpinnerOwnProps;
