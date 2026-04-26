import type { EmptyStateProps } from "./empty-state.types";

function classes(...values: Array<unknown>): string | undefined {
  const value = values.filter((item) => typeof item === "string" && item.trim()).join(" ");
  return value || undefined;
}

export function EmptyState(props: EmptyStateProps): JSX.Element {
  const { icon, title, description, actions, children, ref, class: className, ...rest } = props;

  return (
    <div {...rest} ref={ref} class={classes("empty-state", className)} data-slot="empty-state">
      {icon !== undefined ? <div class="empty-state-icon" data-slot="empty-state-icon">{icon}</div> : null}
      {title !== undefined ? <h2 class="empty-state-title" data-slot="empty-state-title">{title}</h2> : null}
      {description !== undefined ? (
        <p class="empty-state-description" data-slot="empty-state-description">{description}</p>
      ) : null}
      {children}
      {actions !== undefined ? <div class="empty-state-actions" data-slot="empty-state-actions">{actions}</div> : null}
    </div>
  );
}
