export type SettingsSectionProps = Omit<JSX.IntrinsicElements["section"], "children"> & {
  title?: unknown;
  description?: unknown;
  children?: unknown;
};
