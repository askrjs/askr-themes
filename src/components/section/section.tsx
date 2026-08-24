import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Block } from "../block";
import type { SectionProps } from "./section.types";

/** Renders a `<section>`-element {@link Block} with vertical spacing between children and page padding. */
export function Section(props: SectionProps): JSX.Element {
  const { children, ...rest } = props;

  return (
    <Block as="section" direction="column" gap="lg" paddingY="xl" {...rest} data-slot="section">
      {children}
    </Block>
  );
}
