import type { JSX } from "@askrjs/askr/jsx-runtime";
import { ProgressCircle, ProgressCircleIndicator } from "@askrjs/ui";
import type { SpinnerProps } from "./spinner.types";

/** Indeterminate loading spinner built on `ProgressCircle`, with an accessible label (defaults to `"Loading"`) and a `size` modifier. */
export function Spinner(props: SpinnerProps): JSX.Element {
  const {
    label,
    size,
    "aria-label": ariaLabel,
    ...rest
  } = props as SpinnerProps & {
    "aria-label"?: string;
  };

  return (
    <ProgressCircle
      {...rest}
      aria-label={ariaLabel ?? label ?? "Loading"}
      data-spinner="true"
      data-size={size && size !== "md" ? size : undefined}
      value={null}
      getValueLabel={() => label ?? "Loading"}
    >
      <ProgressCircleIndicator />
    </ProgressCircle>
  );
}
