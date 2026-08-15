import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Block } from "../block";
import type { AsideProps } from "./aside.types";

/** Renders a `<aside>`-element {@link Block} tagged with `data-slot="aside"`. */
export function Aside(props: AsideProps): JSX.Element {
  const { children, ...rest } = props;

  return (
    <Block as="aside" {...rest} data-slot="aside">
      {children}
    </Block>
  );
}
