import { ProgressCircle } from "@askrjs/ui";
import type { SpinnerProps } from "./spinner.types";

export function Spinner(props: SpinnerProps): JSX.Element {
  const {
    label,
    "aria-label": ariaLabel,
    ...rest
  } = props as SpinnerProps & {
    "aria-label"?: string;
  };

  return (
    <ProgressCircle
      {...rest}
      aria-label={ariaLabel ?? label ?? "Loading"}
      value={null}
      getValueLabel={() => label ?? "Loading"}
    />
  );
}
