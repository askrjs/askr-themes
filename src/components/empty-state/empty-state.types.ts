import type { BlockDivProps } from "../block";

/** Heading tag allowed for an empty state's title via `titleAs`. */
export type EmptyStateHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** Props for the {@link EmptyState} component. */
export type EmptyStateProps = BlockDivProps & {
  icon?: unknown;
  title?: unknown;
  titleAs?: EmptyStateHeadingTag;
  description?: unknown;
  action?: unknown;
};
