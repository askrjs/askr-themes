import { Slot } from "@askrjs/askr/foundations";
import { mergeProps } from "@askrjs/askr/foundations/utilities";
import { classes } from "../_internal/classes";
import type {
  ListGroupItemAsChildProps,
  ListGroupItemProps,
  ListGroupProps,
} from "./list-group.types";

export function ListGroup(props: ListGroupProps): JSX.Element {
  const {
    children,
    class: className,
    flush = false,
    orientation = "vertical",
    ref,
    ...rest
  } = props;

  return (
    <ul
      {...rest}
      ref={ref}
      class={classes(
        "list-group",
        flush ? "list-group-flush" : undefined,
        orientation === "horizontal" ? "list-group-horizontal" : undefined,
        className,
      )}
      data-flush={flush ? "true" : "false"}
      data-orientation={orientation}
      data-slot="list-group"
    >
      {children}
    </ul>
  );
}

export function ListGroupItem(props: ListGroupItemProps): JSX.Element;
export function ListGroupItem(props: ListGroupItemAsChildProps): JSX.Element;
export function ListGroupItem(props: ListGroupItemProps | ListGroupItemAsChildProps): JSX.Element {
  const {
    action = false,
    active = false,
    asChild,
    children,
    disabled = false,
    ref,
    class: className,
    ...rest
  } = props;
  const finalProps = mergeProps(rest, {
    class: classes(
      "list-group-item",
      action ? "list-group-item-action" : undefined,
      active ? "active" : undefined,
      disabled ? "disabled" : undefined,
      className,
    ),
    ref,
    "aria-current": active ? "page" : undefined,
    "aria-disabled": disabled ? "true" : undefined,
    "data-action": action ? "true" : undefined,
    "data-active": active ? "true" : undefined,
    "data-disabled": disabled ? "true" : undefined,
    "data-slot": "list-group-item",
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <li {...finalProps}>{children}</li>;
}
