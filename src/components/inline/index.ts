import { Flex } from '../flex';
import type { InlineProps } from '../flex';

export function Inline(props: InlineProps): JSX.Element {
  return Flex({ ...(props as Record<string, unknown>), 'data-slot': 'inline' } as never);
}

export { Flex };
export {
  FLEX_A11Y_CONTRACT,
  FLEX_A11Y_CONTRACT as INLINE_A11Y_CONTRACT,
  type FlexA11yContract,
  type FlexA11yContract as InlineA11yContract,
} from '../flex/flex.a11y';
export type {
  FlexProps,
  FlexOwnProps,
  FlexNativeProps,
  FlexDivProps,
  FlexSpanProps,
  FlexAsChildProps,
  FlexProps as InlineProps,
  FlexOwnProps as InlineOwnProps,
  FlexNativeProps as InlineNativeProps,
  FlexDivProps as InlineDivProps,
  FlexSpanProps as InlineSpanProps,
  FlexAsChildProps as InlineAsChildProps,
} from '../flex/flex.types';
