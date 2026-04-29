import { Slot, mergeProps } from '@askrjs/ui/foundations';
import {
  applyBoxLayoutStyles,
  splitBoxLayoutProps,
  withBoxLayoutStyle,
} from '../_internal/box-layout';
import { serializeResponsiveValueIf } from '../_internal/layout';
import type { SectionAsChildProps, SectionElementProps } from './section.types';

function isSectionSizeToken(value: unknown): value is string {
  return typeof value === 'string' && ['1', '2', '3', '4'].includes(value.trim());
}

export function Section(props: SectionElementProps): JSX.Element;
export function Section(props: SectionAsChildProps): JSX.Element;
export function Section(props: SectionElementProps | SectionAsChildProps) {
  const {
    asChild,
    children,
    size = '3',
    ref,
    style: userStyle,
    ...rest
  } = props;

  const { boxProps, rest: passthroughProps } = splitBoxLayoutProps(rest);
  const layoutStyle: Record<string, string | number> = {};
  applyBoxLayoutStyles(layoutStyle, boxProps);

  const finalProps = mergeProps(passthroughProps, {
    ref,
    'data-slot': 'section',
    'data-ak-layout': 'true',
    'data-size': serializeResponsiveValueIf(size, isSectionSizeToken),
    style: withBoxLayoutStyle(layoutStyle, userStyle),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <section {...finalProps}>{children}</section>;
}

