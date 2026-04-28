import { classes } from '../_internal/classes';
import type { EmptyStateProps } from "./empty-state.types";

export function EmptyState(props: EmptyStateProps): JSX.Element {
  const {
    icon,
    title,
    titleAs: TitleTag = 'h2',
    description,
    actions,
    children,
    ref,
    class: className,
    ...rest
  } = props;

  return (
    <div {...rest} ref={ref} class={classes("empty-state", className)} data-slot="empty-state">
      {icon !== undefined ? <div class="empty-state-icon" data-slot="empty-state-icon">{icon}</div> : null}
      {title !== undefined ? <TitleTag class="empty-state-title" data-slot="empty-state-title">{title}</TitleTag> : null}
      {description !== undefined ? (
        <p class="empty-state-description" data-slot="empty-state-description">{description}</p>
      ) : null}
      {children}
      {actions !== undefined ? <div class="empty-state-actions" data-slot="empty-state-actions">{actions}</div> : null}
    </div>
  );
}
