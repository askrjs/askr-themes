import { Block } from "../block";
import type { SectionProps } from "./section.types";

export function Section(props: SectionProps): JSX.Element {
  const { children, ...rest } = props;

  return (
    <Block as="section" gap="lg" paddingY="xl" {...rest} data-slot="section">
      {children}
    </Block>
  );
}
