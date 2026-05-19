import { readContext } from "@askrjs/askr";
import { renderShellPanel } from "../shell/shell-panel";
import { SidebarResponsiveContext } from "./sidebar.context";
import type { SidebarPanelProps } from "./sidebar.types";

export function SidebarPanel(props: SidebarPanelProps): JSX.Element | null {
  const {
    active: activeProp,
    brand,
    children,
    class: className,
    collapseLabel: collapseLabelProp,
    onClose,
    open: openProp,
    panelId: panelIdProp,
    ref,
    ...rest
  } = props;
  const needsResponsiveContext =
    activeProp === undefined ||
    collapseLabelProp === undefined ||
    onClose === undefined ||
    openProp === undefined ||
    panelIdProp === undefined;
  const responsive = needsResponsiveContext
    ? (() => {
        try {
          return readContext(SidebarResponsiveContext);
        } catch {
          return {
            active: () => false,
            collapseLabel: () => "Menu",
            closePanel: () => undefined,
            iconCollapsed: () => false,
            isRailCollapsible: () => false,
            orientation: () => "vertical" as const,
            panelId: () => undefined,
            panelOpen: () => false,
            togglePanel: () => undefined,
            toggleRail: () => undefined,
          };
        }
      })()
    : {
        active: () => false,
        collapseLabel: () => "Menu",
        closePanel: () => undefined,
        iconCollapsed: () => false,
        isRailCollapsible: () => false,
        orientation: () => "vertical" as const,
        panelId: () => undefined,
        panelOpen: () => false,
        togglePanel: () => undefined,
        toggleRail: () => undefined,
      };
  const active = activeProp ?? responsive.active();
  const open = openProp ?? responsive.panelOpen();
  const panelId = panelIdProp ?? responsive.panelId();
  const collapseLabel = collapseLabelProp ?? responsive.collapseLabel();
  const closePanel = onClose ?? responsive.closePanel;

  return renderShellPanel({
    active,
    brand,
    children,
    className,
    collapseLabel,
    dataOrientation: responsive.orientation(),
    onClose: closePanel,
    open,
    panelId,
    prefix: "sidebar",
    ref,
    rest,
  });
}
