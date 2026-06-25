import type { BlockDivProps } from "../block";

export type EmptyStateHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type EmptyStateProps = BlockDivProps & {
  icon?: unknown;
  title?: unknown;
  titleAs?: EmptyStateHeadingTag;
  description?: unknown;
  action?: unknown;
};
