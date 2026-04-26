import type { SettingsSectionProps } from "./settings-section.types";

function classes(...values: Array<unknown>): string | undefined {
  const value = values.filter((item) => typeof item === "string" && item.trim()).join(" ");
  return value || undefined;
}

export function SettingsSection(props: SettingsSectionProps): JSX.Element {
  const { title, description, children, ref, class: className, ...rest } = props;

  return (
    <section {...rest} ref={ref} class={classes("settings-section", className)} data-slot="settings-section">
      <div class="settings-section-copy" data-slot="settings-section-copy">
        {title !== undefined ? <h2 class="settings-section-title" data-slot="settings-section-title">{title}</h2> : null}
        {description !== undefined ? (
          <p class="settings-section-description" data-slot="settings-section-description">{description}</p>
        ) : null}
      </div>
      <div class="settings-section-content" data-slot="settings-section-content">{children}</div>
    </section>
  );
}
