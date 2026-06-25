import { Block } from "../block";
import type { SidebarProps } from "./sidebar.types";

export function Sidebar(props: SidebarProps): JSX.Element {
  const { children, width = "sidebar", shrink = false, ...rest } = props;

  return (
    <Block
      as="aside"
      width={width}
      shrink={shrink}
      minHeight="screen"
      padding="md"
      borderRight
      background="surface"
      gap="lg"
      {...rest}
      data-slot="sidebar"
    >
      {children}
    </Block>
  );
}
