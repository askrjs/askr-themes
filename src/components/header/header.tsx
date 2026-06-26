import { Block } from "../block";
import type { HeaderProps } from "./header.types";

export function Header(props: HeaderProps): JSX.Element {
  const { children, position, sticky = position === "sticky", ...rest } = props;

  return (
    <Block
      as="header"
      sticky={sticky}
      top={sticky ? "0" : undefined}
      zIndex={sticky ? "header" : undefined}
      background="surface"
      borderBottom
      {...rest}
      data-slot="header"
    >
      {children}
    </Block>
  );
}
