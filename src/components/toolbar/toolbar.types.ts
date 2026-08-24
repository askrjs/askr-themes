import type { BlockDivProps } from "../block";

/** Props for the {@link Toolbar} component. */
export type ToolbarProps = Omit<BlockDivProps, "direction" | "rowFrom"> & {
  title: unknown;
  actions?: unknown;
  direction?: never;
  rowFrom?: never;
};
