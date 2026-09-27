import type { JSX } from "@askrjs/askr/jsx-runtime";
import { classes } from "../_internal/classes";
import { ButtonGroupProps } from "./button-group.types";

/**
 * Groups related buttons together, optionally visually attached, with a horizontal or vertical
 * orientation and `role="group"` by default. Attached groups without an explicit `orientation`
 * stack at phone width unless they contain icon buttons; pass `orientation="horizontal"` to
 * keep the row.
 */
export function ButtonGroup(props: ButtonGroupProps): JSX.Element {
  const { attached = true, children, class: className, orientation, ref, role, ...rest } = props;
  // A caller-supplied data-responsive wins; otherwise attached groups without an orientation opt in.
  const responsive =
    (rest as Record<string, unknown>)["data-responsive"] ??
    (attached && orientation == null ? "true" : undefined);

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
      data-responsive={responsive as string | undefined}
      data-slot="button-group"
      role={(role ?? "group") as string}
    >
      {children}
    </div>
  );
}
