import type { BlockDivProps } from "../block";

/** Props for the {@link Toolbar} component. */
export type ToolbarProps = BlockDivProps & {
  title: unknown;
  actions?: unknown;
};
