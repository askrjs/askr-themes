import { TopbarLayout as ThemeAgnosticTopbarLayout } from "../components/topbar-layout";
import type { TopbarLayoutProps } from "../components/topbar-layout";

import "../themes/default/components/navbar.css";
import "../themes/default/components/responsive-layout.css";

export type { TopbarLayoutProps };

export function TopbarLayout(props: TopbarLayoutProps): JSX.Element {
  return <ThemeAgnosticTopbarLayout {...props} />;
}
