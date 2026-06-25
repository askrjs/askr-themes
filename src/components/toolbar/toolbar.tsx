import { Block } from "../block";
import type { ToolbarProps } from "./toolbar.types";

export function Toolbar(props: ToolbarProps): JSX.Element {
  const { title, actions, ...rest } = props;

  return (
    <Block
      direction={{ base: "column", md: "row" }}
      align={{ base: "start", md: "center" }}
      justify="between"
      gap="md"
      {...rest}
      data-slot="toolbar"
    >
      <h2 data-slot="toolbar-title">{title}</h2>
      {actions !== undefined ? (
        <Block direction="row" gap="sm" data-slot="toolbar-actions">
          {actions}
        </Block>
      ) : null}
    </Block>
  );
}
