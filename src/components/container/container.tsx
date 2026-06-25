import { Block } from "../block";
import type { ContainerProps } from "./container.types";

export function Container(props: ContainerProps): JSX.Element {
  const { children, size = "page", ...rest } = props;

  return (
    <Block
      maxWidth={size}
      marginX="auto"
      paddingX="page"
      width="full"
      {...rest}
      data-slot="container"
    >
      {children}
    </Block>
  );
}
