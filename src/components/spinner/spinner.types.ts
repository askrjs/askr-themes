import type { ProgressCircleProps } from "@askrjs/ui";

export type SpinnerSize = "sm" | "md" | "lg";

export type SpinnerOwnProps = Omit<ProgressCircleProps, "value" | "getValueLabel"> & {
  label?: string;
  size?: SpinnerSize;
};

export type SpinnerProps = SpinnerOwnProps;
