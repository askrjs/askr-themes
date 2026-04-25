import { SidebarLayout as ThemeAgnosticSidebarLayout } from "../components/sidebar-layout";
import type { SidebarLayoutProps, SidebarPosition } from "../components/sidebar-layout";

import "../themes/default/components/responsive-layout.css";
import "../themes/default/components/sidebar.css";

export type { SidebarLayoutProps, SidebarPosition };

export function SidebarLayout(props: SidebarLayoutProps): JSX.Element {
  return <ThemeAgnosticSidebarLayout {...props} />;
}
