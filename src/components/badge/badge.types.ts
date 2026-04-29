import type { JSXElement, Ref } from '@askrjs/ui/foundations';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type BadgeOwnProps = {
  children?: unknown;
  variant?: BadgeVariant;
};

export type BadgeProps = Omit<
  JSX.IntrinsicElements['span'],
  'children' | 'ref'
> &
  BadgeOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLSpanElement>;
  };

export type BadgeAsChildProps = BadgeOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

