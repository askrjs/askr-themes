import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Block } from "../block";
import { Container } from "../container";
import type { PageProps } from "./page.types";

/** Top-level page wrapper: a growing `<main>` containing a {@link Container} with vertical page padding and content spacing. */
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
