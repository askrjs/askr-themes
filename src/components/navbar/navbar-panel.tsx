import { readContext } from "@askrjs/askr";
import { renderShellPanel } from "../shell/shell-panel";
import { NavbarResponsiveContext } from "./navbar.context";
import type { NavbarPanelProps } from "./navbar.types";

const DEFAULT_NAVBAR_RESPONSIVE_CONTEXT = {
  active: () => false,
  collapseLabel: () => "Menu",
  closePanel: () => undefined,
  panelId: () => undefined,
  panelOpen: () => false,
  togglePanel: () => undefined,
};

export function NavbarPanel(props: NavbarPanelProps): JSX.Element | null {
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
          return readContext(NavbarResponsiveContext);
        } catch {
          return DEFAULT_NAVBAR_RESPONSIVE_CONTEXT;
        }
      })()
    : DEFAULT_NAVBAR_RESPONSIVE_CONTEXT;
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
    onClose: closePanel,
    open,
    panelId,
    prefix: "navbar",
    ref,
    rest,
  });
}
