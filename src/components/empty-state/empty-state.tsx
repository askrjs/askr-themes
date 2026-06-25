import { Block } from "../block";
import type { EmptyStateProps } from "./empty-state.types";

export function EmptyState(props: EmptyStateProps): JSX.Element {
  const {
    icon,
    title,
    titleAs: TitleTag = "h2",
    description,
    action,
    children,
    ...rest
  } = props;

  return (
    <Block center minHeight="content" padding="xl" {...rest} data-slot="empty-state">
      <Block align="center" gap="md" maxWidth="sm" data-slot="empty-state-content">
        {icon !== undefined ? <div data-slot="empty-state-icon">{icon}</div> : null}
        {title !== undefined ? <TitleTag data-slot="empty-state-title">{title}</TitleTag> : null}
        {description !== undefined ? (
          <p data-slot="empty-state-description">{description}</p>
        ) : null}
        {children}
        {action !== undefined ? (
          <Block direction="row" justify="center" gap="sm" data-slot="empty-state-actions">
            {action}
          </Block>
        ) : null}
      </Block>
    </Block>
  );
}
