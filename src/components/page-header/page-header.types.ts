import type { BlockDivProps } from "../block";

/** Props for the {@link PageHeader} component. */
export type PageHeaderProps = Omit<BlockDivProps, "direction" | "rowFrom"> & {
  title: unknown;
  description?: unknown;
  actions?: unknown;
  direction?: never;
  rowFrom?: never;
};
