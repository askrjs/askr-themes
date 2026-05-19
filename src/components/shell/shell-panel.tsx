import { classes } from "../_internal/classes";
import { mergeProps } from "../_internal/merge-props";

export type ShellPanelRenderProps = {
  active: boolean;
  brand?: unknown;
  children?: unknown;
  className?: unknown;
  collapseLabel: string;
  dataOrientation?: string;
  onClose: () => void;
  open: boolean;
  panelId?: string;
  prefix: "navbar" | "sidebar";
  ref?: unknown;
  rest: Record<string, unknown>;
};

export function renderShellPanel(props: ShellPanelRenderProps): JSX.Element | null {
  const {
    active,
    brand,
    children,
    className,
    collapseLabel,
    dataOrientation,
    onClose,
    open,
    panelId,
    prefix,
    ref,
    rest,
  } = props;

  if (active && !open) {
    return null;
  }

  const panelClass = `${prefix}-panel`;
  const headerClass = `${prefix}-panel-header`;
  const closeClass = `${prefix}-panel-close`;
  const headerSlot = `${prefix}-panel-header`;
  const closeSlot = `${prefix}-panel-close`;

  const finalProps = mergeProps(rest, {
    ref,
    class: classes(panelClass, className),
    "aria-label": active ? collapseLabel : rest["aria-label"],
    "aria-modal": active ? "true" : rest["aria-modal"],
    "data-slot": panelClass,
    "data-state": active ? (open ? "open" : "closed") : "open",
    id: panelId,
    role: rest.role,
    tabIndex: active ? -1 : rest.tabIndex,
    ...(dataOrientation !== undefined ? { "data-orientation": dataOrientation } : {}),
  }) as Record<string, unknown>;

  if (active) {
    finalProps.role = "dialog";
    finalProps["aria-modal"] = "true";
    finalProps["aria-label"] = collapseLabel;
    finalProps.tabIndex = -1;
    finalProps.id = panelId;
  }

  return (
    <div {...finalProps}>
      {active ? (
        <div class={headerClass} data-slot={headerSlot}>
          {brand}
          <button
            aria-label={`Close ${collapseLabel}`}
            class={closeClass}
            data-slot={closeSlot}
            type="button"
            onClick={() => onClose()}
          >
            <span aria-hidden="true">x</span>
          </button>
        </div>
      ) : null}
      {children}
    </div>
  );
}
