import { classes } from "../_internal/classes";
import { ButtonGroupProps } from "./button-group.types";

export function ButtonGroup(props: ButtonGroupProps): JSX.Element {
  const {
    attached = true,
    children,
    class: className,
    orientation = "horizontal",
    ref,
    role,
    ...rest
  } = props;

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
      data-orientation={orientation}
      data-slot="button-group"
      role={(role ?? "group") as string}
    >
      {children}
    </div>
  );
}
