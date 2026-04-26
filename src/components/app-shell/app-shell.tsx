import type { AppShellProps } from "./app-shell.types";

function classes(...values: Array<unknown>): string | undefined {
  const value = values.filter((item) => typeof item === "string" && item.trim()).join(" ");
  return value || undefined;
}

export function AppShell(props: AppShellProps): JSX.Element {
  const { sidebar, topbar, children, footer, ref, class: className, ...rest } = props;

  return (
    <div {...rest} ref={ref} class={classes("app-shell", className)} data-slot="app-shell">
      {sidebar !== undefined ? <aside class="app-shell-sidebar" data-slot="app-shell-sidebar">{sidebar}</aside> : null}
      <div class="app-shell-body" data-slot="app-shell-body">
        {topbar !== undefined ? <header class="app-shell-topbar" data-slot="app-shell-topbar">{topbar}</header> : null}
        <main class="app-shell-main" data-slot="app-shell-main">{children}</main>
        {footer !== undefined ? <footer class="app-shell-footer" data-slot="app-shell-footer">{footer}</footer> : null}
      </div>
    </div>
  );
}
