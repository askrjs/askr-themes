export type EmptyStateHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type EmptyStateProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  icon?: unknown;
  title?: unknown;
  titleAs?: EmptyStateHeadingTag;
  description?: unknown;
  actions?: unknown;
  children?: unknown;
};
