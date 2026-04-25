import { SidebarLayout as PrimitiveSidebarLayout } from "@askrjs/askr-ui/patterns/sidebar-layout";
import type { SidebarLayoutProps, SidebarPosition } from "@askrjs/askr-ui/patterns/sidebar-layout";

export type { SidebarLayoutProps, SidebarPosition };

export function SidebarLayout(props: SidebarLayoutProps): JSX.Element {
  return <PrimitiveSidebarLayout {...props} />;
}
