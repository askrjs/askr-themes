import { Button, type ButtonNativeProps } from "@askrjs/ui";
import { classes } from "../_internal/classes";
import type { CloseNativeProps } from "./close.types";

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
