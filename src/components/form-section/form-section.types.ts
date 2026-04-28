export type FormSectionHeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type FormSectionProps = Omit<JSX.IntrinsicElements["section"], "children"> & {
  title?: unknown;
  titleAs?: FormSectionHeadingTag;
  description?: unknown;
  actions?: unknown;
  children?: unknown;
};
