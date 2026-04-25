import { TopbarLayout as PrimitiveTopbarLayout } from "@askrjs/askr-ui/patterns/topbar-layout";
import type { TopbarLayoutProps } from "@askrjs/askr-ui/patterns/topbar-layout";

export type { TopbarLayoutProps };

export function TopbarLayout(props: TopbarLayoutProps): JSX.Element {
  return <PrimitiveTopbarLayout {...props} />;
}
