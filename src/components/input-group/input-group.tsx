import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Slot } from "@askrjs/askr/foundations";
import { mergeProps } from "@askrjs/askr/foundations/utilities";
import { classes } from "../_internal/classes";
import { intrinsicElement } from "../_internal/jsx";
import type {
  InputGroupProps,
  InputGroupTextAsChildProps,
  InputGroupTextProps,
} from "./input-group.types";

/** Groups related inputs/addons together, optionally visually attached, with a horizontal or vertical orientation and `role="group"` by default. */
export function InputGroup(props: InputGroupProps): JSX.Element {
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
        "input-group",
        orientation === "vertical" ? "input-group-vertical" : undefined,
        className,
      )}
      data-attached={attached ? "true" : "false"}
      data-orientation={orientation}
      data-slot="input-group"
      role={(role ?? "group") as string}
    >
      {children}
    </div>
  );
}

/** Renders static text/label content within an {@link InputGroup}. */
export function InputGroupText(props: InputGroupTextProps): JSX.Element;
export function InputGroupText(props: InputGroupTextAsChildProps): JSX.Element;
export function InputGroupText(
  props: InputGroupTextProps | InputGroupTextAsChildProps,
): JSX.Element {
  const { asChild, children, ref, class: className, ...rest } = props;
  const finalProps = mergeProps(rest, {
    class: classes("input-group-text", className),
    ref,
    "data-slot": "input-group-text",
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return intrinsicElement("span", finalProps, children);
}
