import type { JSX } from "@askrjs/askr/jsx-runtime";
import { classes } from "../_internal/classes";
import { ButtonGroupProps } from "./button-group.types";

/**
 * Groups related buttons together, optionally visually attached, with a horizontal or vertical
 * orientation and `role="group"` by default. Without an explicit `orientation`, attached groups
 * stack at phone width; pass `orientation="horizontal"` to keep the row.
 */
export function ButtonGroup(props: ButtonGroupProps): JSX.Element {
  const { attached = true, children, class: className, orientation, ref, role, ...rest } = props;

  return (
    <div
      {...rest}
      ref={ref}
      class={classes(
        "btn-group",
        orientation === "vertical" ? "btn-group-vertical" : undefined,
        className,
      )}
      data-attached={attached ? "true" : "false"}
      data-orientation={orientation ?? "horizontal"}
      data-responsive={orientation === undefined ? "true" : undefined}
      data-slot="button-group"
      role={(role ?? "group") as string}
    >
      {children}
    </div>
  );
}
