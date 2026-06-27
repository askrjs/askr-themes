import { Block } from "../block";
import type { PageHeaderProps } from "./page-header.types";

export function PageHeader(props: PageHeaderProps): JSX.Element {
  const { title, description, actions, ...rest } = props;

  return (
    <Block
      rowFrom="md"
      align={{ base: "start", md: "center" }}
      justify="between"
      gap="lg"
      {...rest}
      data-slot="page-header"
    >
      <Block gap="xs" data-slot="page-header-copy">
        <h1 data-slot="page-header-title">{title}</h1>
        {description !== undefined ? (
          <p data-slot="page-header-description">{description}</p>
        ) : null}
      </Block>
      {actions !== undefined ? (
        <Block direction="row" gap="sm" data-slot="page-header-actions">
          {actions}
        </Block>
      ) : null}
    </Block>
  );
}
