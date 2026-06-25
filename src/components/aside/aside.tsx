import { Block } from "../block";
import type { AsideProps } from "./aside.types";

export function Aside(props: AsideProps): JSX.Element {
  const { children, ...rest } = props;

  return (
    <Block as="aside" {...rest} data-slot="aside">
      {children}
    </Block>
  );
}
