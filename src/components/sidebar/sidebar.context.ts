import { defineContext } from "@askrjs/askr";

export type SidebarContextValue = {
  orientation: () => "vertical";
};

export type SidebarResponsiveContextValue = {
  active: () => boolean;
  collapseLabel: () => string;
  closePanel: () => void;
  iconCollapsed: () => boolean;
  isRailCollapsible: () => boolean;
  orientation: () => "vertical";
  panelId: () => string | undefined;
  panelOpen: () => boolean;
  togglePanel: () => void;
  toggleRail: () => void;
};

const defaultOrientation = () => "vertical" as const;

const defaultResponsiveContext: SidebarResponsiveContextValue = {
  active: () => false,
  collapseLabel: () => "Menu",
  closePanel: () => undefined,
  iconCollapsed: () => false,
  isRailCollapsible: () => false,
  orientation: defaultOrientation,
  panelId: () => undefined,
  panelOpen: () => false,
  togglePanel: () => undefined,
  toggleRail: () => undefined,
};

export const SidebarContext = defineContext<SidebarContextValue>({
  orientation: defaultOrientation,
});

export const SidebarResponsiveContext =
  defineContext<SidebarResponsiveContextValue>(defaultResponsiveContext);
