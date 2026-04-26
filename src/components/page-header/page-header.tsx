import type { PageHeaderProps } from "./page-header.types";

function classes(...values: Array<unknown>): string | undefined {
  const value = values.filter((item) => typeof item === "string" && item.trim()).join(" ");
  return value || undefined;
}

export function PageHeader(props: PageHeaderProps): JSX.Element {
  const { eyebrow, title, description, meta, actions, children, ref, class: className, ...rest } = props;

  return (
    <header {...rest} ref={ref} class={classes("page-header", className)} data-slot="page-header">
      <div class="page-header-content" data-slot="page-header-content">
        {eyebrow !== undefined ? <div class="page-header-eyebrow" data-slot="page-header-eyebrow">{eyebrow}</div> : null}
        {title !== undefined ? <h1 class="page-header-title" data-slot="page-header-title">{title}</h1> : null}
        {description !== undefined ? (
          <p class="page-header-description" data-slot="page-header-description">{description}</p>
        ) : null}
        {meta !== undefined ? <div class="page-header-meta" data-slot="page-header-meta">{meta}</div> : null}
        {children}
      </div>
      {actions !== undefined ? <div class="page-header-actions" data-slot="page-header-actions">{actions}</div> : null}
    </header>
  );
}
