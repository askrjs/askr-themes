import { Block } from "../block";
import type { MainProps } from "./main.types";

export function Main(props: MainProps): JSX.Element {
  const { children, ...rest } = props;

  return (
    <Block as="main" grow {...rest} data-slot="main">
      {children}
    </Block>
  );
}
