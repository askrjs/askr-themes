import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Block } from "../block";
import type { MainProps } from "./main.types";

/** Renders a `<main>`-element {@link Block} that grows to fill available space. */
export function Main(props: MainProps): JSX.Element {
  const { children, ...rest } = props;

  return (
    <Block as="main" grow {...rest} data-slot="main">
      {children}
    </Block>
  );
}
