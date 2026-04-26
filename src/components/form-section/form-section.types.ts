export type FormSectionProps = Omit<JSX.IntrinsicElements["section"], "children"> & {
  title?: unknown;
  description?: unknown;
  actions?: unknown;
  children?: unknown;
};
