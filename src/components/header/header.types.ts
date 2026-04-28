export type HeaderPosition =
  | 'static'
  | 'relative'
  | 'sticky'
  | 'absolute'
  | 'fixed';

export type HeaderProps = Omit<JSX.IntrinsicElements['header'], 'children'> & {
  position?: HeaderPosition;
  children?: unknown;
};