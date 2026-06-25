import type { BlockDivProps } from "../block";

export type PageHeaderProps = BlockDivProps & {
  title: unknown;
  description?: unknown;
  actions?: unknown;
};
