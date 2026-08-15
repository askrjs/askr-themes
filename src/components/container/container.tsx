import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Block } from "../block";
import type { ContainerProps } from "./container.types";

/** Centers content in a max-width column with page gutters (defaults to the `"page"` {@link BlockSize}). */
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
