import type { JSXElement, Ref } from '@askrjs/ui/foundations';
import type { BoxLayoutOwnProps, LayoutResponsive } from '../box/box.types';

export type ContainerVariant =
  | 'default'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'xxl'
  | 'fluid';

export type ContainerOwnProps = BoxLayoutOwnProps & {
  /** Bootstrap-like responsive container variant. */
  variant?: ContainerVariant;
  /** Makes the container span the full available width while preserving gutters. */
  fluid?: boolean;
  /** Radix-style container size token. */
  size?: LayoutResponsive<'1' | '2' | '3' | '4' | 'sm' | 'md' | 'lg' | 'xl'>;
  /** Horizontal alignment of the constrained container. */
  align?: LayoutResponsive<'left' | 'center' | 'right'>;
  /** Compatibility max-width override. */
  maxWidth?: LayoutResponsive<string>;
  /** Compatibility horizontal padding override. */
  padding?: LayoutResponsive<string | number>;
  children?: unknown;
};

export type ContainerNativeProps = Omit<
  JSX.IntrinsicElements['div'],
  'children' | 'ref'
> &
  ContainerOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLDivElement>;
  };

export type ContainerAsChildProps = ContainerOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
  style?: JSX.IntrinsicElements['div']['style'];
};

export type ContainerProps = ContainerNativeProps | ContainerAsChildProps;

