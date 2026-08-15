import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Button, type ButtonNativeProps } from "@askrjs/ui";
import { classes } from "../_internal/classes";
import type { CloseNativeProps } from "./close.types";

/** Renders a dismiss ("×") icon button, built on top of `Button`, defaulting to an icon-sized ghost variant with an accessible `label`. */
export function Close(props: CloseNativeProps): JSX.Element;
export function Close(props: CloseNativeProps): JSX.Element {
  const { children, class: className, label = "Close", size, variant, ...rest } = props;
  return (
    <Button
      {...(rest as ButtonNativeProps)}
      class={classes("btn-close", className)}
      aria-label={label}
      size={size ?? "icon"}
      variant={variant ?? "ghost"}
    >
      {children ?? <span aria-hidden="true">×</span>}
    </Button>
  );
}
