import { classes } from "../_internal/classes";
import { Close } from "../close";
import type { AlertProps } from "./alert.types";

function resolveAlertRole(variant: AlertProps["variant"] | undefined): "alert" | "status" {
  if (variant === "danger" || variant === "warning") {
    return "alert";
  }

  return "status";
}

export function Alert(props: AlertProps): JSX.Element {
  const {
    actions,
    children,
    class: className,
    description,
    dismissLabel = "Dismiss alert",
    icon,
    onDismiss,
    ref,
    title,
    titleAs: TitleTag = "h3",
    variant = "default",
    role,
    ...rest
  } = props;
  const shouldRenderDismiss = onDismiss !== undefined;
  const resolvedRole = role ?? resolveAlertRole(variant);
  const hasVariant = variant !== "default";

  return (
    <div
      {...rest}
      ref={ref}
      class={classes(
        "alert",
        hasVariant ? `alert-${variant}` : undefined,
        shouldRenderDismiss ? "alert-dismissible" : undefined,
        className,
      )}
      data-dismissible={shouldRenderDismiss ? "true" : undefined}
      data-slot="alert"
      data-variant={hasVariant ? variant : undefined}
      role={resolvedRole}
    >
      {icon !== undefined ? (
        <div aria-hidden="true" class="alert-icon" data-slot="alert-icon">
          {icon}
        </div>
      ) : null}

      <div class="alert-content" data-slot="alert-content">
        {title !== undefined ? (
          <TitleTag class="alert-title" data-slot="alert-title">
            {title}
          </TitleTag>
        ) : null}

        {description !== undefined ? (
          <p class="alert-description" data-slot="alert-description">
            {description}
          </p>
        ) : null}

        {children}

        {actions !== undefined ? (
          <div class="alert-actions" data-slot="alert-actions">
            {actions}
          </div>
        ) : null}
      </div>

      {shouldRenderDismiss ? (
        <div class="alert-close" data-slot="alert-close">
          <Close label={dismissLabel} onPress={onDismiss} />
        </div>
      ) : null}
    </div>
  );
}
