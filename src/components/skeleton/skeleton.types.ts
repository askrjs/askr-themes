import type { JSXElement, Ref } from '@askrjs/ui/foundations';

export type SkeletonOwnProps = {
  children?: unknown;
};

export type SkeletonProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'ref'
> &
  SkeletonOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type SkeletonAsChildProps = SkeletonOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
};

