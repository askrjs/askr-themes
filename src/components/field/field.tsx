import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";
import type { FieldErrorProps, FieldHintProps, FieldProps } from "./field.types";

export function Field(props: FieldProps): JSX.Element {
  const { children, class: className, invalid = false, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    class: classes("field", className),
    ref,
    "data-slot": "field",
    "data-invalid": invalid ? "true" : undefined,
  });

  return <div {...finalProps}>{children}</div>;
}

export function FieldHint(props: FieldHintProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    class: classes("field-hint", className),
    ref,
    "data-slot": "field-hint",
  });

  return <p {...finalProps}>{children}</p>;
}

export function FieldError(props: FieldErrorProps): JSX.Element {
  const { children, class: className, ref, ...rest } = props;
  const finalProps = mergeProps(rest, {
    class: classes("field-error", className),
    ref,
    role: "alert",
    "data-slot": "field-error",
  });

  return <p {...finalProps}>{children}</p>;
}
