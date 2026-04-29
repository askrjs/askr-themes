export type SettingsSectionHeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type SettingsSectionProps = Omit<JSX.IntrinsicElements["section"], "children"> & {
  title?: unknown;
  titleAs?: SettingsSectionHeadingTag;
  description?: unknown;
  children?: unknown;
};
