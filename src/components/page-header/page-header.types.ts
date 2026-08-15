import type { BlockDivProps } from "../block";

/** Props for the {@link PageHeader} component. */
export type PageHeaderProps = BlockDivProps & {
  title: unknown;
  description?: unknown;
  actions?: unknown;
};
