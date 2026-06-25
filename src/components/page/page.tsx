import { Block } from "../block";
import { Container } from "../container";
import type { PageProps } from "./page.types";

export function Page(props: PageProps): JSX.Element {
  const { children, ...rest } = props;

  return (
    <Block as="main" grow {...rest} data-slot="page">
      <Container>
        <Block paddingY="xl" gap="lg">
          {children}
        </Block>
      </Container>
    </Block>
  );
}
