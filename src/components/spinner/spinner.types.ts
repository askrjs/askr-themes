import type { ProgressCircleProps } from "@askrjs/ui";

export type SpinnerOwnProps = Omit<ProgressCircleProps, "value" | "getValueLabel"> & {
  label?: string;
};

export type SpinnerProps = SpinnerOwnProps;
