import type { FormSectionProps } from "./form-section.types";

function classes(...values: Array<unknown>): string | undefined {
  const value = values.filter((item) => typeof item === "string" && item.trim()).join(" ");
  return value || undefined;
}

export function FormSection(props: FormSectionProps): JSX.Element {
  const { title, description, actions, children, ref, class: className, ...rest } = props;

  return (
    <section {...rest} ref={ref} class={classes("form-section", className)} data-slot="form-section">
      <div class="form-section-header" data-slot="form-section-header">
        <div class="form-section-heading" data-slot="form-section-heading">
          {title !== undefined ? <h2 class="form-section-title" data-slot="form-section-title">{title}</h2> : null}
          {description !== undefined ? (
            <p class="form-section-description" data-slot="form-section-description">{description}</p>
          ) : null}
        </div>
        {actions !== undefined ? <div class="form-section-actions" data-slot="form-section-actions">{actions}</div> : null}
      </div>
      <div class="form-section-content" data-slot="form-section-content">{children}</div>
    </section>
  );
}
