import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Block } from "../block";
import { Stack } from "../intent-layouts";
import type { EmptyStateProps } from "./empty-state.types";

/** Centered placeholder for empty lists/views: an icon, title (default `<h2>`), description, extra content, and an action row. */
export function EmptyState(props: EmptyStateProps): JSX.Element {
  const { icon, title, titleAs: TitleTag = "h2", description, action, children, ...rest } = props;

  return (
    <Block center minHeight="content" padding="xl" {...rest} data-slot="empty-state">
      <Stack align="center" gap="md" maxWidth="sm" data-slot="empty-state-content">
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
      </Stack>
    </Block>
  );
}
