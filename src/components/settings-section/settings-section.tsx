import { classes } from '../_internal/classes';
import type { SettingsSectionProps } from "./settings-section.types";

export function SettingsSection(props: SettingsSectionProps): JSX.Element {
  const {
    title,
    titleAs: TitleTag = 'h2',
    description,
    children,
    ref,
    class: className,
    ...rest
  } = props;

  return (
    <section {...rest} ref={ref} class={classes("settings-section", className)} data-slot="settings-section">
      <div class="settings-section-copy" data-slot="settings-section-copy">
        {title !== undefined ? <TitleTag class="settings-section-title" data-slot="settings-section-title">{title}</TitleTag> : null}
        {description !== undefined ? (
          <p class="settings-section-description" data-slot="settings-section-description">{description}</p>
        ) : null}
      </div>
      <div class="settings-section-content" data-slot="settings-section-content">{children}</div>
    </section>
  );
}
