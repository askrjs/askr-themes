export type AppShellProps = Omit<JSX.IntrinsicElements["div"], "children"> & {
  sidebar?: unknown;
  topbar?: unknown;
  children?: unknown;
  footer?: unknown;
};
