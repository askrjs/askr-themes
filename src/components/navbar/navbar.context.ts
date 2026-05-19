import { defineContext } from "@askrjs/askr";

export type NavbarResponsiveContextValue = {
  active: () => boolean;
  collapseLabel: () => string;
  closePanel: () => void;
  panelId: () => string | undefined;
  panelOpen: () => boolean;
  togglePanel: () => void;
};

const defaultResponsiveContext: NavbarResponsiveContextValue = {
  active: () => false,
  collapseLabel: () => "Menu",
  closePanel: () => undefined,
  panelId: () => undefined,
  panelOpen: () => false,
  togglePanel: () => undefined,
};

export const NavbarResponsiveContext =
  defineContext<NavbarResponsiveContextValue>(defaultResponsiveContext);
